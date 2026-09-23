const PRODUCTION_URL = "https://omerbalyali.com";

export const SITE = {
	name: "Ömer Balyalı",
	url: import.meta.env.SITE_URL ?? PRODUCTION_URL,
	description: "Personal website of Ömer Balyalı.",
	locale: "en_US",
	themeColor: "#fff",
	author: {
		name: "Ömer Balyalı",
	},
	sections: {
		about: {
			title: "About",
			description: "Ömer Balyalı is a design engineer based in Berlin, Germany.",
		},
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
