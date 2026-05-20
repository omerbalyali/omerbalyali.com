import { expect, test } from "@playwright/test";

test.describe("generated feeds and discovery files", () => {
	test("publishes RSS items newest first", async ({ request }) => {
		const response = await request.get("/rss.xml");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toMatch(/xml/);

		const xml = await response.text();
		const items = Array.from(xml.matchAll(/<item>(.*?)<\/item>/gs), ([, item]) => ({
			title: item.match(/<title>(.*?)<\/title>/)?.[1],
			link: item.match(/<link>(.*?)<\/link>/)?.[1],
			pubDate: item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1],
		}));

		expect(items.length).toBeGreaterThan(0);
		expect(items.every((item) => item.title && item.link && item.pubDate)).toBe(true);
		expect(items.every((item) => item.link?.startsWith("https://omerbalyali.com/writing/"))).toBe(true);
		expect(items.map((item) => Date.parse(item.pubDate ?? ""))).toEqual(
			[...items].map((item) => Date.parse(item.pubDate ?? "")).sort((a, b) => b - a),
		);
		expect(xml).toContain("<language>en-us</language>");
	});

	test("points crawlers at the sitemap", async ({ request }) => {
		const response = await request.get("/robots.txt");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toMatch(/^text\/plain/);

		await expect(response.text()).resolves.toBe(
			["User-agent: *", "Allow: /", "Sitemap: https://omerbalyali.com/sitemap-index.xml"].join("\n"),
		);
	});

	test("keeps the sitemap focused on public routes", async ({ request }) => {
		const response = await request.get("/sitemap-0.xml");
		expect(response.status()).toBe(200);

		const xml = await response.text();
		const locations = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), (match) => match[1]);

		expect(locations).toEqual(
			expect.arrayContaining([
				"https://omerbalyali.com/",
				"https://omerbalyali.com/about/",
				"https://omerbalyali.com/legal-notice/",
				"https://omerbalyali.com/privacy-policy/",
				"https://omerbalyali.com/writing/",
			]),
		);
		expect(locations.length).toBeGreaterThanOrEqual(5);
		expect(locations.every((location) => location.startsWith("https://omerbalyali.com/"))).toBe(true);
		expect(locations.some((location) => location.includes("/_works/"))).toBe(false);
		expect(locations.some((location) => location.includes("/og/"))).toBe(false);
	});
});
