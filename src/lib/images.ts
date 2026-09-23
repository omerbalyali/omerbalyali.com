import type { ImageMetadata } from "astro";

// Largest CSS widths optimized images are displayed at. With the `constrained` image layout (astro.config.ts),
// Astro builds a srcset up to 2x these and a matching `sizes`, so small screens get small files.
// Work pages skip this on purpose and serve originals (see src/components/OriginalImage.astro).

/** Prose column: `max-width: 56rem` in ProseLayout and WorkDetail. */
export const CONTENT_IMAGE_WIDTH = 896;

type LocalImage = ImageMetadata | Promise<{ default: ImageMetadata }>;

/** Display width for a local image: the layout's cap, but never wider than the file itself. */
export async function displayWidth(image: LocalImage, cap: number): Promise<number> {
	const metadata = "then" in image ? (await image).default : image;
	return Math.min(metadata.width, cap);
}
