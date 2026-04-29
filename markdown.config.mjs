import {
	transformerMetaHighlight,
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
} from "@shikijs/transformers";

/** @type {import("astro").AstroUserConfig["markdown"]} */
export const markdownConfig = {
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
