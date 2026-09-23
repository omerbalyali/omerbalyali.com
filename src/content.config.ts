import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const writing = defineCollection({
	loader: glob({
		base: "./src/content/writing",
		pattern: "**/*.{md,mdx}",
	}),
	schema: z.object({
		title: z.string().max(70),
		description: z.string().max(160),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		draft: z.boolean().default(false),
		unlisted: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		ogImage: z.string().optional(),
		canonicalURL: z.url().optional(),
		series: z.string().optional(),
	}),
});

const works = defineCollection({
	loader: glob({
		base: "./src/content/works",
		pattern: "**/*.{md,mdx}",
	}),
	schema: z.object({
		title: z.string(),
		// A single year or a range, e.g. 2026 or "2025-2026".
		year: z.coerce.string(),
		description: z.string(),
		// Position on the works page, ascending.
		order: z.number(),
		ogImage: z.string().optional(),
	}),
});

export const collections = { writing, works };
