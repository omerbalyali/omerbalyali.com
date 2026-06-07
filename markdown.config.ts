import {
	transformerMetaHighlight,
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import type { UnifiedProcessorOptions } from "@astrojs/markdown-remark";
import type { AstroUserConfig } from "astro";
import { remarkReadingTime } from "./src/lib/remark-reading-time";

type MarkdownConfig = NonNullable<AstroUserConfig["markdown"]>;
type ShikiTransformer = NonNullable<NonNullable<MarkdownConfig["shikiConfig"]>["transformers"]>[number];
type HastText = {
	type: "text";
	value: string;
};
type HastElement = {
	type: "element";
	tagName: string;
	properties: {
		class?: string | string[];
		className?: string | string[];
		[key: string]: string | number | boolean | (string | number)[] | null | undefined;
	};
	children: HastElementContent[];
};
type HastElementContent = HastElement | HastText;

const hasMetaFlag = (raw: string, flags: string[]) =>
	flags.some((flag) => new RegExp(`\\b${flag}\\b`, "i").test(raw));
const lineNumberFlags = ["lineNumbers", "line-numbers", "lines"];

function transformerCodeExampleMeta(): ShikiTransformer {
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

function transformerWrapCodeLines(): ShikiTransformer {
	const hasClass = (node: HastElementContent, className: string) => {
		if (node.type !== "element") {
			return false;
		}

		const classes = node.properties?.className ?? node.properties?.class;
		const list = Array.isArray(classes) ? classes : String(classes ?? "").split(/\s+/);

		return list.includes(className);
	};
	const countLines = (children: HastElementContent[]) =>
		children.filter((child) => child.type === "element" && hasClass(child, "line") && child.children.length)
			.length;
	const createLineNumbers = (count: number): HastElement => ({
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
	const createCodeLines = (children: HastElementContent[]): HastElement => ({
		type: "element",
		tagName: "span",
		properties: { className: ["code-lines"] },
		children,
	});

	return {
		name: "wrap-code-lines",
		code(node) {
			const raw = this.options.meta?.__raw ?? "";
			const children = node.children as HastElementContent[];
			const lineNumbers = hasMetaFlag(raw, lineNumberFlags) ? [createLineNumbers(countLines(children))] : [];

			node.children = [...lineNumbers, createCodeLines(children)];
		},
	};
}

export const markdownConfig = {
	shikiConfig: {
		themes: {
			light: "github-light",
			dark: "github-dark",
		},
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
} satisfies Pick<MarkdownConfig, "shikiConfig">;

export const markdownProcessorConfig = {
	remarkPlugins: [remarkReadingTime],
} satisfies UnifiedProcessorOptions;
