import { type CollectionKey, getCollection } from "astro:content";
import { SITE } from "../site";
import { OG_SIZES, type OgSize, type OgVariant } from "./og";

export interface OgRoute {
	slug: string;
	title?: string;
	variant: OgVariant;
}

const DEFAULT_OG_SLUG = "default";

const OG_COLLECTIONS = ["writing"] as const satisfies readonly CollectionKey[];

interface MdxPageModule {
	frontmatter?: { title?: string };
}

const mdxPageModules = import.meta.glob<MdxPageModule>("/src/pages/**/*.mdx", {
	eager: true,
});

export async function discoverOgRoutes(): Promise<OgRoute[]> {
	const seen = new Set<string>();
	const routes: OgRoute[] = [];

	function add(route: OgRoute) {
		if (seen.has(route.slug)) return;
		seen.add(route.slug);
		routes.push(route);
	}

	add({ slug: DEFAULT_OG_SLUG, variant: "default" });

	for (const [key, section] of Object.entries(SITE.sections)) {
		add({ slug: key, title: section.title, variant: "page" });
	}

	for (const [filePath, mod] of Object.entries(mdxPageModules)) {
		if (filePath.includes("[")) continue;
		const slug = pageFilePathToSlug(filePath);
		if (!slug) continue;
		const title = mod.frontmatter?.title;
		if (!title) continue;
		add({ slug, title, variant: "page" });
	}

	for (const collection of OG_COLLECTIONS) {
		const entries = await getCollection(collection, ({ data }) => {
			if (!import.meta.env.PROD) return true;
			return "draft" in data ? data.draft !== true : true;
		});
		for (const entry of entries) {
			const data = entry.data as { title?: string };
			if (!data.title) continue;
			const slug = `${collection}/${entry.id}`;
			add({ slug, title: data.title, variant: "page" });
		}
	}

	return routes;
}

function pageFilePathToSlug(filePath: string): string {
	return filePath
		.replace(/^\/src\/pages\//, "")
		.replace(/\.(astro|mdx)$/, "")
		.replace(/\/index$/, "")
		.replace(/^index$/, "");
}

function pathnameToSlug(pathname: string): string {
	const trimmed = pathname.replace(/^\/+|\/+$/g, "");
	return trimmed || DEFAULT_OG_SLUG;
}

export function getOgImagePath(pathname: string, size: OgSize = "wide"): string {
	return `/og/${size}/${pathnameToSlug(pathname)}.png`;
}

export function getOgImageMetadata(pathname: string, size: OgSize = "wide") {
	const dimensions = OG_SIZES[size];
	return {
		ogImage: getOgImagePath(pathname, size),
		ogImageWidth: dimensions.width,
		ogImageHeight: dimensions.height,
	};
}
