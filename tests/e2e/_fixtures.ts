import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DIST_PATH = resolve(process.cwd(), "dist");
const SITEMAP_PATH = resolve(DIST_PATH, "sitemap-0.xml");

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

/** Work detail pages are built but kept out of the sitemap (they are noindex). */
function loadWorkDetailRoutes(): string[] {
	return readdirSync(resolve(DIST_PATH, "works"), { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => `/works/${entry.name}/`)
		.sort();
}

/** Public, indexable routes from the sitemap. */
export const routes = loadRoutes();

/** Routes that are built and reachable but deliberately absent from the sitemap. */
export const workDetailRoutes = loadWorkDetailRoutes();

/** Any path that does not exist, to exercise the 404 page. */
export const missingRoute = "/this-page-does-not-exist/";
