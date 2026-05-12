import {
	transformerMetaHighlight,
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
} from "@shikijs/transformers";
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

/** @type {import("astro").AstroUserConfig["markdown"]} */
export const markdownConfig = {
	remarkPlugins: [remarkReadingTime],
	shikiConfig: {
		themes: /** @type {const} */ ({
			light: "github-light",
			dark: "github-dark",
		}),
		transformers: [
			transformerMetaHighlight(),
			transformerNotationDiff(),
			transformerNotationFocus(),
			transformerNotationHighlight(),
		],
	},
};
