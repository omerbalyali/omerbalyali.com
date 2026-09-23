const PRODUCTION_URL = "https://omerbalyali.com";
const NAME = "Ömer Balyalı";
const SITE_URL = import.meta.env.SITE_URL ?? PRODUCTION_URL;

export const SITE = {
	name: NAME,
	url: SITE_URL,
	description: "Personal website of Ömer Balyalı.",
	feed: {
		path: "/rss.xml",
		// Writing is the only feed, so it carries the site's name rather than a section title.
		title: `${NAME} - ${new URL(SITE_URL).host}`,
	},
	locale: "en_US",
	formatLocale: "en-DE",
	// Fixed brand colors for contexts CSS tokens can't reach (browser UI, generated images).
	colors: {
		// Hex equivalents of --t-color-background-root in each color scheme.
		themeColor: {
			light: "#f8f8f8",
			dark: "#0a0b0c",
		},
		// Open Graph images: always light, with slightly softer text than the site.
		og: {
			background: "#ffffff",
			foreground: "#1b1b1b",
			muted: "#555555",
		},
	},
	author: {
		name: NAME,
		jobTitle: "Design Engineer",
		location: "Berlin, Germany",
	},
	// Footer links and the Person structured data's `sameAs`.
	social: [
		{ label: "GitHub", url: "https://github.com/omerbalyali" },
		{ label: "LinkedIn", url: "https://linkedin.com/in/omerbalyali" },
		{ label: "X", url: "https://x.com/omerbalyali" },
		{ label: "Bluesky", url: "https://bsky.app/profile/omerbalyali.com" },
	],
	sections: {
		works: {
			title: "Works",
			description: "Selected works by Ömer Balyalı.",
		},
		writing: {
			title: "Writing",
			description: "Articles on design and technology by Ömer Balyalı.",
		},
	},
	og: {
		defaultImage: "/og/wide/default.png",
		defaultImageWidth: 1200,
		defaultImageHeight: 630,
	},
} as const;

/** False for preview and other non-production deployments, which should stay out of search results. */
export const IS_PRODUCTION_SITE = new URL(SITE.url).origin === new URL(PRODUCTION_URL).origin;
