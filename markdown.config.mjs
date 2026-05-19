import {
	transformerMetaHighlight,
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import { remarkReadingTime } from "./src/lib/remark-reading-time.mjs";

const hasMetaFlag = (raw, flags) => flags.some((flag) => new RegExp(`\\b${flag}\\b`, "i").test(raw));
const lineNumberFlags = ["lineNumbers", "line-numbers", "lines"];

function transformerCodeExampleMeta() {
	return {
		name: "code-example-meta",
		pre(node) {
			const raw = this.options.meta?.__raw ?? "";

			if (hasMetaFlag(raw, lineNumberFlags)) {
				this.addClassToHast(node, "has-line-numbers");
			}

			if (hasMetaFlag(raw, ["badge", "langBadge", "language-badge"])) {
				this.addClassToHast(node, "has-language-badge");
			}
		},
	};
}

function transformerWrapCodeLines() {
	const hasClass = (node, className) => {
		const classes = node.properties?.className ?? node.properties?.class;
		const list = Array.isArray(classes) ? classes : String(classes ?? "").split(/\s+/);

		return list.includes(className);
	};
	const countLines = (children) =>
		children.filter((child) => child.type === "element" && hasClass(child, "line") && child.children?.length)
			.length;
	const createLineNumbers = (count) => ({
		type: "element",
		tagName: "span",
		properties: {
			ariaHidden: "true",
			className: ["line-numbers"],
		},
		children: Array.from({ length: count }, (_, index) => ({
			type: "element",
			tagName: "span",
			properties: { className: ["line-number"] },
			children: [{ type: "text", value: String(index + 1) }],
		})),
	});
	const createCodeLines = (children) => ({
		type: "element",
		tagName: "span",
		properties: { className: ["code-lines"] },
		children,
	});

	return {
		name: "wrap-code-lines",
		code(node) {
			const raw = this.options.meta?.__raw ?? "";
			const children = node.children;
			const lineNumbers = hasMetaFlag(raw, lineNumberFlags) ? [createLineNumbers(countLines(children))] : [];

			node.children = [...lineNumbers, createCodeLines(children)];
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
			transformerMetaHighlight(),
			transformerNotationDiff(),
			transformerNotationFocus(),
			transformerNotationHighlight(),
			transformerCodeExampleMeta(),
			transformerRemoveLineBreak(),
			transformerWrapCodeLines(),
		],
	},
};
