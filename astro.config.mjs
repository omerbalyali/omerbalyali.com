// @ts-check
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { Features } from "lightningcss";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { markdownConfig } from "./markdown.config.mjs";

// https://astro.build/config
const siteUrl = process.env.SITE_URL ?? "https://omerbalyali.com";

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
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes("/og/") })],
	devToolbar: {
		enabled: false,
	},
	vite: {
		define: {
			"import.meta.env.SITE_URL": JSON.stringify(siteUrl),
		},
		ssr: {
			external: ["@resvg/resvg-wasm", "satori"],
		},
		optimizeDeps: {
			exclude: ["@resvg/resvg-wasm", "satori"],
		},
		css: {
			transformer: "lightningcss",
			lightningcss: {
				include: Features.LightDark,
			},
		},
	},
	site: siteUrl,
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
		{
			provider: fontProviders.local(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			options: {
				variants: [
					{
						src: ["./src/assets/fonts/JetBrainsMono-Variable.woff2"],
						weight: "100 900",
						style: "normal",
					},
				],
			},
		},
	],
});
