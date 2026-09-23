// Lightweight OG helpers for pages and layouts. Keep this module free of the MDX page glob in
// og-pages.ts: importing that from a page pulls every MDX page's CSS into the page's bundle.

export const OG_SIZES = {
	wide: { width: 1200, height: 630 },
	square: { width: 600, height: 600 },
} as const;

export type OgSize = keyof typeof OG_SIZES;

export const DEFAULT_OG_SLUG = "default";

function pathnameToSlug(pathname: string): string {
	const trimmed = pathname.replace(/^\/+|\/+$/g, "");
	return trimmed || DEFAULT_OG_SLUG;
}

export function getOgImagePath(pathname: string, size: OgSize = "wide"): string {
	return `/og/${size}/${pathnameToSlug(pathname)}.png`;
}

export function getOgImageMetadata(pathname: string, size: OgSize = "wide") {
	const dimensions = OG_SIZES[size];
	return {
		ogImage: getOgImagePath(pathname, size),
		ogImageWidth: dimensions.width,
		ogImageHeight: dimensions.height,
	};
}
