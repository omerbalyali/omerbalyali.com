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

export const collections = { writing };
