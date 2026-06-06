import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SITEMAP_PATH = resolve(process.cwd(), "dist/sitemap-0.xml");

function loadRoutes(): string[] {
	let xml: string;
	try {
		xml = readFileSync(SITEMAP_PATH, "utf8");
	} catch (error) {
		throw new Error(`Could not read ${SITEMAP_PATH}. Run \`pnpm run build\` before running e2e tests.`, {
			cause: error,
		});
	}
	const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
	return Array.from(matches, (m) => new URL(m[1]).pathname).sort();
}

export const routes = loadRoutes();
