// Web font subsets, generated from src/assets/fonts/source/ by scripts/subset-fonts.sh (keep the
// ranges in sync). Same split as Google Fonts' "latin" and "latin-ext" subsets.

type UnicodeRange = [string, ...string[]];

export const LATIN: UnicodeRange = [
	"U+0000-00FF",
	"U+0131",
	"U+0152-0153",
	"U+02BB-02BC",
	"U+02C6",
	"U+02DA",
	"U+02DC",
	"U+0304",
	"U+0308",
	"U+0329",
	"U+2000-206F",
	"U+20AC",
	"U+2122",
	"U+2191",
	"U+2193",
	"U+2212",
	"U+2215",
	"U+FEFF",
	"U+FFFD",
];

export const LATIN_EXT: UnicodeRange = [
	"U+0100-02BA",
	"U+02BD-02C5",
	"U+02C7-02CC",
	"U+02CE-02D7",
	"U+02DD-02FF",
	"U+0304",
	"U+0308",
	"U+0329",
	"U+1D00-1DBF",
	"U+1E00-1E9F",
	"U+1EF2-1EFF",
	"U+2020",
	"U+20A0-20AB",
	"U+20AD-20C0",
	"U+2113",
	"U+2C60-2C7F",
	"U+A720-A7FF",
];

interface FontVariant {
	file: string;
	style: "normal" | "italic";
	unicodeRange?: UnicodeRange;
	/** Preload on every page. Astro's preload filter can't tell subsets apart, so Head does it. */
	preload?: boolean;
}

// Latin Extended comes first: where ranges overlap (e.g. ı), the last @font-face wins, so pages
// only download the extended file when they actually use its characters.
export const INTER_VARIANTS: FontVariant[] = [
	{ file: "Inter-Variable-latin-ext.woff2", style: "normal", unicodeRange: LATIN_EXT },
	{ file: "Inter-Variable-Italic-latin-ext.woff2", style: "italic", unicodeRange: LATIN_EXT },
	{ file: "Inter-Variable-latin.woff2", style: "normal", unicodeRange: LATIN, preload: true },
	{ file: "Inter-Variable-Italic-latin.woff2", style: "italic", unicodeRange: LATIN },
];

// One file: code needs Latin, Latin Extended, arrows, box drawing and check marks.
export const JETBRAINS_MONO_VARIANTS: FontVariant[] = [
	{ file: "JetBrainsMono-Variable-code.woff2", style: "normal" },
];

/** Astro local-provider variants, in the same order (Head relies on it to find preloads). */
export function toAstroVariants(variants: FontVariant[]) {
	const [first, ...rest] = variants.map(({ file, style, unicodeRange }) => ({
		src: [`./src/assets/fonts/${file}`] as [string],
		weight: "100 900",
		style,
		...(unicodeRange ? { unicodeRange } : {}),
	}));
	return [first, ...rest] as [typeof first, ...(typeof first)[]];
}
