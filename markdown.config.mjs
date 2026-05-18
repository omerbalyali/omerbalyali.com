import {
	transformerMetaHighlight,
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

function transformerCodeExampleMeta() {
	const hasMetaFlag = (raw, flags) => flags.some((flag) => new RegExp(`\\b${flag}\\b`, "i").test(raw));

	return {
		name: "code-example-meta",
		pre(node) {
			const raw = this.options.meta?.__raw ?? "";

			if (hasMetaFlag(raw, ["lineNumbers", "line-numbers", "lines"])) {
				this.addClassToHast(node, "has-line-numbers");
			}

			if (hasMetaFlag(raw, ["badge", "langBadge", "language-badge"])) {
				this.addClassToHast(node, "has-language-badge");
			}
		},
	};
}

/** @type {import("astro").AstroUserConfig["markdown"]} */
export const markdownConfig = {
	remarkPlugins: [remarkReadingTime],
	shikiConfig: {
		themes: /** @type {const} */ ({
			light: "github-light",
			dark: "github-dark",
		}),
		transformers: [
			transformerCodeExampleMeta(),
			transformerMetaHighlight(),
			transformerNotationDiff(),
			transformerNotationFocus(),
			transformerNotationHighlight(),
			transformerRemoveLineBreak(),
		],
	},
};
