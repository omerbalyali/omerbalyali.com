import { default as rss, type RSSOptions } from "@astrojs/rss";
import { getCollection } from "astro:content";
import { getWritingPath } from "../lib/seo";
import { SITE } from "../site";

export async function GET(context: RSSOptions) {
	const posts = await getCollection("writing", ({ data }) => data.draft !== true);

	posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

	return rss({
		title: SITE.sections.writing.title,
		description: SITE.sections.writing.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			link: getWritingPath(post.id),
		})),
		customData: `<language>en-us</language>`,
	});
}
