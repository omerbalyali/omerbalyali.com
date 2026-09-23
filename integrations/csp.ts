import type { AstroIntegration } from "astro";
import { createHash } from "node:crypto";
import { appendFile, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Content Security Policy for the static build, sent as a header via dist/_headers.
//
// Astro's built-in `security.csp` doesn't support <ClientRouter /> or Shiki, so instead this
// hashes every inline <script> and <style> in the built pages after the build and allows exactly
// those. The policy is one union for all pages (a _headers rule can't vary per page), which keeps
// it well under Cloudflare's 2,000-character header limit for a site this size.
//
// Style *attributes* (Shiki token colors, image and carousel custom properties) can't be hashed
// without 'unsafe-hashes', so they're allowed via style-src-attr 'unsafe-inline'. They can't run
// code; scripts stay hash-only.

const HEADER_LIMIT = 2000;

interface CspOptions {
	/** Extra origins allowed to serve scripts and receive requests (e.g. analytics). */
	thirdPartyOrigins?: string[];
}

const hash = (content: string) => `'sha256-${createHash("sha256").update(content).digest("base64")}'`;

async function listHtmlFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true, recursive: true });
	return entries
		.filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
		.map((entry) => join(entry.parentPath, entry.name));
}

export function buildPolicy(html: string[], { thirdPartyOrigins = [] }: CspOptions = {}) {
	const scriptHashes = new Set<string>();
	const styleHashes = new Set<string>();

	for (const page of html) {
		for (const [, attributes, content] of page.matchAll(
			/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g,
		)) {
			// JSON-LD and other data blocks never execute, so CSP doesn't apply to them.
			if (/type=["']?application\/(ld\+)?json/.test(attributes)) continue;
			scriptHashes.add(hash(content));
		}
		for (const [, content] of page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
			styleHashes.add(hash(content));
		}
	}

	const origins = thirdPartyOrigins.join(" ");
	return [
		"default-src 'self'",
		`script-src 'self' ${origins} ${[...scriptHashes].sort().join(" ")}`,
		`style-src 'self' ${[...styleHashes].sort().join(" ")}`,
		"style-src-attr 'unsafe-inline'",
		"img-src 'self' data:",
		"font-src 'self'",
		`connect-src 'self' ${origins}`,
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		"upgrade-insecure-requests",
	]
		.map((directive) => directive.replace(/\s+/g, " ").trim())
		.join("; ");
}

export default function csp(options: CspOptions = {}): AstroIntegration {
	return {
		name: "csp",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const pages = await Promise.all((await listHtmlFiles(outDir)).map((file) => readFile(file, "utf8")));
				const policy = buildPolicy(pages, options);

				if (policy.length > HEADER_LIMIT) {
					throw new Error(
						`The generated Content-Security-Policy is ${policy.length} characters, over Cloudflare's ` +
							`${HEADER_LIMIT}-character header limit. Reduce inline scripts and styles ` +
							`(e.g. build.inlineStylesheets: "never").`,
					);
				}

				await appendFile(
					join(outDir, "_headers"),
					`\n# Generated at build time by integrations/csp.ts.\n/*\n  Content-Security-Policy: ${policy}\n`,
				);
				logger.info(`Content-Security-Policy written to _headers (${policy.length} characters).`);
			},
		},
	};
}
