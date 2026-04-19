// @ts-check
import mdx from "@astrojs/mdx";
import { defineConfig, fontProviders } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

// https://astro.build/config
export default defineConfig({
	integrations: [
		mdx({
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: "wrap", test: ["h2", "h3", "h4", "h5", "h6"] }],
			],
		}),
	],
	devToolbar: {
		enabled: false,
	},
	site: "https://omerbalyali.com",
	trailingSlash: "always",
	fonts: [
		{
			provider: fontProviders.local(),
			name: "Inter",
			cssVariable: "--font-inter",
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/Inter-Variable.woff2"],
						weight: "100 900",
						style: "normal",
					},
					{
						src: ["./src/assets/fonts/Inter-Variable-Italic.woff2"],
						weight: "100 900",
						style: "italic",
					},
				],
			},
		},
	],
});
