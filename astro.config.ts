import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import { Features } from "lightningcss";
import { existsSync, readFileSync } from "node:fs";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import { markdownConfig, markdownProcessorConfig } from "./markdown.config";

// https://astro.build/config
const siteUrl = process.env.SITE_URL ?? "https://omerbalyali.com";
const cssTarget = (major: number, minor = 0, patch = 0) => (major << 16) | (minor << 8) | patch;
const useLocalHttps = ["1", "true", "yes"].includes((process.env.LOCAL_HTTPS ?? "").toLowerCase());
const localHttpsKey = "./localhost-key.pem";
const localHttpsCert = "./localhost.pem";
const shouldIncludeInSitemap = (page: string) => {
	const { pathname } = new URL(page, siteUrl);
	const isWorkDetailPage = pathname.startsWith("/works/") && pathname !== "/works/";

	return !pathname.startsWith("/og/") && !isWorkDetailPage && pathname !== "/writing/";
};

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
	markdown: {
		...markdownConfig,
		processor: unified({
			...markdownProcessorConfig,
			rehypePlugins: [
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: "wrap", test: ["h2", "h3", "h4", "h5", "h6"] }],
			],
		}),
	},
	integrations: [
		mdx(),
		sitemap({ filter: shouldIncludeInSitemap }),
		// Import the global stylesheet at page level rather than from a component: Astro emits
		// page-level CSS before any layout's or component's own styles, so the cascade layer
		// order declared in index.css always comes first.
		{
			name: "global-styles",
			hooks: {
				"astro:config:setup": ({ injectScript }) => {
					injectScript("page-ssr", 'import "/src/styles/index.css";');
				},
			},
		},
	],
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
		build: {
			// The CSS minifier drops vendor prefixes its target doesn't need. Vite's default target
			// has desktop Safari but not iOS, so -webkit-text-size-adjust (iOS only) was removed and
			// mobile Safari inflated text. Keep this in sync with the Lightning CSS targets below.
			cssTarget: ["chrome111", "edge111", "firefox114", "safari17", "ios17"],
		},
		css: {
			transformer: "lightningcss",
			lightningcss: {
				include: Features.LightDark,
				// Baseline: Safari 17 (Sep 2023). The site already needs it for popover, and it is
				// the first Safari that doesn't crash on color-mix() with currentColor.
				targets: {
					ios_saf: cssTarget(17),
					safari: cssTarget(17),
				},
			},
		},
	},
	// Responsive images: <Image> gets a srcset and sizes. Pass `width` as the largest CSS width
	// the image is shown at (see src/lib/images.ts); layout styling stays in our own CSS.
	image: {
		layout: "constrained",
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
