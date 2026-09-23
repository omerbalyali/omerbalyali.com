import { getCollection } from "astro:content";
import { SITE } from "../site";
import type { OgVariant } from "./og";
import { DEFAULT_OG_SLUG } from "./og-image";
import { getPublishedPosts } from "./writing";

export interface OgRoute {
	slug: string;
	title?: string;
	variant: OgVariant;
}

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

	for (const post of await getPublishedPosts()) {
		add({ slug: `writing/${post.id}`, title: post.data.title, variant: "page" });
	}

	for (const work of await getCollection("works")) {
		add({ slug: `works/${work.id}`, title: work.data.title, variant: "page" });
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
