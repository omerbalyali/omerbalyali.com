import { type CollectionEntry, getCollection } from "astro:content";

export type Post = CollectionEntry<"writing">;

const newestFirst = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/** Every post that gets a page, newest first. Drafts are included only in development. */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection("writing", ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort(newestFirst);
}

/** Published posts that may appear in lists and feeds; unlisted posts are reachable by link only. */
export async function getListedPosts(): Promise<Post[]> {
	return (await getPublishedPosts()).filter((post) => !post.data.unlisted);
}
