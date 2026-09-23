import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve as resolvePath } from "node:path";
import satori from "satori";
import { SITE } from "../site";

import { OG_SIZES, type OgSize } from "./og-image";

export { OG_SIZES, type OgSize };
export type OgVariant = "page" | "default";

const COLORS = SITE.colors.og;

// The logomark comes from the base theme's --t-app-brand-logomark token (the SVG the header
// uses as a mask), so there is one source for the mark. Filled here with the OG text color.
const THEME_APP_CSS = "src/styles/themes/base/app.css";
const LOGO_SVG = readLogomarkFromTheme().replace("<svg ", `<svg fill="${COLORS.foreground}" `);
const LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG)}`;

function readLogomarkFromTheme(): string {
	const css = readFileSync(resolvePath(process.cwd(), THEME_APP_CSS), "utf8");
	const token = css.match(
		/--t-app-brand-logomark:\s*url\((["'])data:image\/svg\+xml[^,]*,(<svg[\s\S]*?<\/svg>)\1\)/,
	);
	if (!token) {
		throw new Error(`Couldn't read an inline SVG from --t-app-brand-logomark in ${THEME_APP_CSS}.`);
	}
	return decodeURIComponent(token[2]);
}

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

function logoImg(size: number, logoOffsetY = 0) {
	return {
		type: "img",
		props: {
			src: LOGO_DATA_URI,
			width: size,
			height: size,
			style: { display: "block", marginTop: logoOffsetY },
		},
	};
}

type Node = unknown;

interface WordmarkOptions {
	orientation: "row" | "column";
	logoSize: number;
	nameSize: number;
	gap: number;
	logoOffsetY?: number;
}

function wordmark({ orientation, logoSize, nameSize, gap, logoOffsetY = 0 }: WordmarkOptions): Node {
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
				logoImg(logoSize, logoOffsetY),
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
			],
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
			logoOffsetY: -6,
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
			gap: 40,
		}),
		bottom: urlBlock(isSquare ? 27 : 32),
	});
}
