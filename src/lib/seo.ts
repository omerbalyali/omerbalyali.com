import { SITE } from "../site";

export interface StructuredData {
	[key: string]: unknown;
}

export interface PageMetadata {
	title?: string;
	description?: string;
	canonicalURL?: string | URL;
	ogImage?: string | URL;
	ogImageAlt?: string;
	ogImageWidth?: number;
	ogImageHeight?: number;
	type?: "website" | "article";
	publishedTime?: Date | string;
	modifiedTime?: Date | string;
	tags?: string[];
	noindex?: boolean;
	structuredData?: StructuredData | StructuredData[];
}

export function absoluteUrl(path: string | URL = "/") {
	if (path instanceof URL) return path.toString();
	return new URL(path, SITE.url).toString();
}

export function resolveTitle(title?: string) {
	return title ? `${title} | ${SITE.name}` : SITE.name;
}

export function serializeDate(value?: Date | string) {
	if (!value) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export function formatDate(value: Date | string, options?: Intl.DateTimeFormatOptions) {
	const date = value instanceof Date ? value : new Date(value);
	return new Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "long",
		day: "numeric",
		...options,
	}).format(date);
}

export function getWritingPath(id: string) {
	return `/writing/${id}/`;
}

export function createWebsiteStructuredData() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: SITE.name,
		description: SITE.description,
		url: absoluteUrl("/"),
	};
}

export function createCollectionPageStructuredData({
	title,
	description,
	path,
}: {
	title: string;
	description: string;
	path: string;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: title,
		description,
		url: absoluteUrl(path),
		isPartOf: createWebsiteStructuredData(),
	};
}

export function createBlogPostingStructuredData({
	title,
	description,
	path,
	imagePath,
	publishedTime,
	modifiedTime,
	tags = [],
}: {
	title: string;
	description: string;
	path: string;
	imagePath?: string | URL;
	publishedTime: Date | string;
	modifiedTime?: Date | string;
	tags?: string[];
}) {
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: title,
		description,
		url: absoluteUrl(path),
		mainEntityOfPage: absoluteUrl(path),
		...(imagePath ? { image: [absoluteUrl(imagePath)] } : {}),
		datePublished: serializeDate(publishedTime),
		...(modifiedTime ? { dateModified: serializeDate(modifiedTime) } : {}),
		...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
		author: {
			"@type": "Person",
			name: SITE.author.name,
			url: absoluteUrl("/"),
		},
		publisher: {
			"@type": "Person",
			name: SITE.author.name,
			url: absoluteUrl("/"),
		},
	};
}
