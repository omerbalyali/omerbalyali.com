import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export function remarkReadingTime() {
	return function (tree: Parameters<typeof toString>[0], { data }: { data: AstroMarkdownData }) {
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);
		const frontmatter = data.astro?.frontmatter;

		if (frontmatter) {
			frontmatter.minutesRead = readingTime.text;
		}
	};
}

type AstroMarkdownData = {
	astro?: {
		frontmatter?: Record<string, unknown>;
	};
};
