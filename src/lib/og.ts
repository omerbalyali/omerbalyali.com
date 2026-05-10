import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve as resolvePath } from "node:path";
import satori from "satori";
import { SITE } from "../site";

export const OG_SIZES = {
	wide: { width: 1200, height: 630 },
	square: { width: 600, height: 600 },
} as const;

export type OgSize = keyof typeof OG_SIZES;
export type OgVariant = "page" | "default";

const COLORS = {
	background: "#ffffff",
	foreground: "#1b1b1b",
	muted: "#555555",
} as const;

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M128 64c35.35 0 64 28.65 64 64h64C256 57.31 198.69 0 128 0S0 57.31 0 128h64c0-35.35 28.65-64 64-64Z" fill="${COLORS.foreground}"/><circle cx="128" cy="192" r="64" fill="${COLORS.foreground}"/></svg>`;
const LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

const HOST = SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

interface LoadedFonts {
	medium: Buffer;
	semibold: Buffer;
}

let cachedFonts: LoadedFonts | undefined;
async function loadFonts(): Promise<LoadedFonts> {
	if (!cachedFonts) {
		const fontsDir = resolvePath(process.cwd(), "src/assets/fonts");
		const [medium, semibold] = await Promise.all([
			readFile(resolvePath(fontsDir, "Inter-Medium.ttf")),
			readFile(resolvePath(fontsDir, "Inter-SemiBold.ttf")),
		]);
		cachedFonts = { medium, semibold };
	}
	return cachedFonts;
}

let resvgInit: Promise<void> | undefined;
function ensureResvgReady(): Promise<void> {
	if (!resvgInit) {
		const require = createRequire(import.meta.url);
		const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
		resvgInit = readFile(wasmPath).then((bytes) => initWasm(bytes));
	}
	return resvgInit;
}

interface RenderOptions {
	variant: OgVariant;
	size: OgSize;
	title?: string;
}

export async function renderOgSvg({ variant, size, title }: RenderOptions): Promise<string> {
	const { width, height } = OG_SIZES[size];
	const fonts = await loadFonts();
	const tree =
		variant === "page" ? buildPageLayout({ title: title ?? SITE.name, size }) : buildDefaultLayout(size);

	return satori(tree as never, {
		width,
		height,
		fonts: [
			{ name: "Inter", data: fonts.medium, weight: 500, style: "normal" },
			{ name: "Inter", data: fonts.semibold, weight: 600, style: "normal" },
		],
	});
}

export async function renderOgImage(options: RenderOptions): Promise<Uint8Array> {
	const { width } = OG_SIZES[options.size];
	const [svg] = await Promise.all([renderOgSvg(options), ensureResvgReady()]);

	return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}

function logoImg(size: number, iconOffsetX = 0) {
	return {
		type: "img",
		props: {
			src: LOGO_DATA_URI,
			width: size,
			height: size,
			style: { display: "block", marginTop: iconOffsetX },
		},
	};
}

type Node = unknown;

interface WordmarkOptions {
	orientation: "row" | "column";
	logoSize: number;
	nameSize: number;
	gap: number;
	iconOffsetX?: number;
}

function wordmark({ orientation, logoSize, nameSize, gap, iconOffsetX = 0 }: WordmarkOptions): Node {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: orientation,
				alignItems: "center",
				gap,
			},
			children: [
				logoImg(logoSize, iconOffsetX),
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							fontSize: nameSize,
							fontWeight: 600,
							letterSpacing: "-0.025em",
							lineHeight: 1,
						},
						children: SITE.name,
					},
				},
			],
		},
	};
}

function urlBlock(fontSize: number): Node {
	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				fontSize,
				fontWeight: 500,
				color: COLORS.muted,
			},
			children: HOST,
		},
	};
}

interface LayoutOptions {
	size: OgSize;
	topHeight: number;
	bottomHeight: number;
	top?: Node | Node[];
	middle?: Node | Node[];
	bottom?: Node | Node[];
	middleStyle?: Record<string, unknown>;
	bottomStyle?: Record<string, unknown>;
}

function toChildren(node: Node | Node[] | undefined): Node[] {
	if (node === undefined) return [];
	return Array.isArray(node) ? node : [node];
}

function buildLayout({
	size,
	topHeight,
	bottomHeight,
	top,
	middle,
	bottom,
	middleStyle,
	bottomStyle,
}: LayoutOptions): Node {
	const isSquare = size === "square";
	const padding = isSquare ? 44 : 60;

	return {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				backgroundColor: COLORS.background,
				padding: `${padding}px`,
				fontFamily: "Inter",
				color: COLORS.foreground,
			},
			children: [
				{
					type: "div",
					props: {
						style: { display: "flex", alignItems: "center", height: topHeight },
						children: toChildren(top),
					},
				},
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							flexGrow: 1,
							alignItems: "flex-start",
							justifyContent: "center",
							...middleStyle,
						},
						children: toChildren(middle),
					},
				},
				{
					type: "div",
					props: {
						style: { display: "flex", alignItems: "center", height: bottomHeight, ...bottomStyle },
						children: toChildren(bottom),
					},
				},
			],
		},
	};
}

function buildPageLayout({ title, size }: { title: string; size: OgSize }): Node {
	const isSquare = size === "square";
	const titleSize = isSquare ? (title.length > 50 ? 44 : 54) : 72;
	const titleStack = {
		type: "div",
		props: {
			style: {
				display: "flex",
				flexDirection: "column",
				gap: isSquare ? 8 : 14,
				maxWidth: "100%",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							fontSize: titleSize,
							fontWeight: 600,
							letterSpacing: "-0.0125em",
							lineHeight: 1.1,
							textWrap: "balance",
						},
						children: title,
					},
				},
			].filter(Boolean),
		},
	};

	return buildLayout({
		size,
		topHeight: isSquare ? 84 : 72,
		bottomHeight: isSquare ? 16 : 12,
		top: wordmark({
			orientation: "row",
			logoSize: isSquare ? 34 : 38,
			nameSize: isSquare ? 36 : 40,
			gap: isSquare ? 18 : 20,
			iconOffsetX: isSquare ? -6 : -6,
		}),
		middle: titleStack,
		bottom: urlBlock(isSquare ? 27 : 30),
	});
}

function buildDefaultLayout(size: OgSize): Node {
	const isSquare = size === "square";

	return buildLayout({
		size,
		topHeight: isSquare ? 32 : 12,
		bottomHeight: isSquare ? 32 : 12,
		middleStyle: { alignItems: "center", justifyContent: "center" },
		bottomStyle: { alignItems: "center", justifyContent: "center" },
		middle: wordmark({
			orientation: "column",
			logoSize: isSquare ? 60 : 72,
			nameSize: isSquare ? 60 : 72,
			gap: isSquare ? 40 : 40,
		}),
		bottom: urlBlock(isSquare ? 27 : 32),
	});
}
