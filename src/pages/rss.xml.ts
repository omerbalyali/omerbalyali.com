import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { absoluteUrl, getWritingPath } from "../lib/seo";
import { getListedPosts } from "../lib/writing";
import { SITE } from "../site";

export async function GET(context: APIContext) {
	const posts = await getListedPosts();

	return rss({
		title: SITE.feed.title,
		description: SITE.sections.writing.description,
		site: context.site ?? SITE.url,
		xmlns: { atom: "http://www.w3.org/2005/Atom" },
		customData: [
			"<language>en-us</language>",
			`<atom:link href="${absoluteUrl(SITE.feed.path)}" rel="self" type="application/rss+xml" />`,
		].join(""),
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: getWritingPath(post.id),
			categories: post.data.tags,
		})),
	});
}
