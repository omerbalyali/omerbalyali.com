import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { Features } from "lightningcss";
import { existsSync, readFileSync } from "node:fs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { markdownConfig } from "./markdown.config";

// https://astro.build/config
const siteUrl = process.env.SITE_URL ?? "https://omerbalyali.com";
const cssTarget = (major: number, minor = 0, patch = 0) => (major << 16) | (minor << 8) | patch;
const useLocalHttps = ["1", "true", "yes"].includes((process.env.LOCAL_HTTPS ?? "").toLowerCase());
const localHttpsKey = "./localhost-key.pem";
const localHttpsCert = "./localhost.pem";

const localHttps = () => {
	if (!useLocalHttps) {
		return undefined;
	}

	if (!existsSync(localHttpsKey) || !existsSync(localHttpsCert)) {
		throw new Error(
			`LOCAL_HTTPS is enabled, but ${localHttpsKey} and/or ${localHttpsCert} could not be found.`,
		);
	}

	return {
		key: readFileSync(localHttpsKey),
		cert: readFileSync(localHttpsCert),
	};
};

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
		server: {
			https: localHttps(),
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
				targets: {
					ios_saf: cssTarget(16),
					safari: cssTarget(16),
				},
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
