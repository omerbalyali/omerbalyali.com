// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { markdownConfig } from "./markdown.config.mjs";

// https://astro.build/config
export default defineConfig({
	adapter: cloudflare({
		imageService: { build: "compile", runtime: "cloudflare-binding" },
		prerenderEnvironment: "node",
	}),
	markdown: {
		...markdownConfig,
		rehypePlugins: [
			rehypeSlug,
			[rehypeAutolinkHeadings, { behavior: "wrap", test: ["h2", "h3", "h4", "h5", "h6"] }],
		],
	},
	integrations: [mdx(), sitemap()],
	devToolbar: {
		enabled: false,
	},
	vite: {
		ssr: {
			external: ["@resvg/resvg-wasm", "satori"],
		},
		optimizeDeps: {
			exclude: ["@resvg/resvg-wasm", "satori"],
		},
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
