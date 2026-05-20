import { expect, test } from "@playwright/test";
import { routes } from "./_fixtures";

const SITE_URL = process.env.SITE_URL ?? "https://omerbalyali.com";

const expectedTitles = new Map([
	["/", "Ömer Balyalı"],
	["/about/", "About | Ömer Balyalı"],
	["/writing/", "Writing | Ömer Balyalı"],
]);

test.describe("page smoke", () => {
	for (const route of routes) {
		test(`${route} responds with 200, has title, canonical, and a reachable og:image`, async ({
			page,
			request,
		}) => {
			const response = await page.goto(route);
			expect(response?.status()).toBe(200);

			const expectedTitle = expectedTitles.get(route);
			if (expectedTitle) {
				await expect(page).toHaveTitle(expectedTitle);
			} else {
				await expect(page).toHaveTitle(/.+/);
			}

			const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
			expect(canonical).toBe(new URL(route, SITE_URL).toString());

			const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
			expect(ogImage, "og:image meta tag should be present").toBeTruthy();

			if (ogImage) {
				const ogPath = new URL(ogImage).pathname;
				const ogResponse = await request.get(ogPath);
				expect(ogResponse.status(), `og:image at ${ogPath} should resolve`).toBe(200);
				expect(ogResponse.headers()["content-type"]).toMatch(/^image\/png/);
			}
		});
	}

	for (const route of routes.filter((route) => route.startsWith("/writing/") && route !== "/writing/")) {
		test(`${route} exposes article metadata and structured data`, async ({ page }) => {
			await page.goto(route);

			const title = await page.getByRole("heading", { level: 1 }).textContent();
			const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
			const publishedTime = await page
				.locator('meta[property="article:published_time"]')
				.getAttribute("content");
			const modifiedTimeMeta = page.locator('meta[property="article:modified_time"]');
			const modifiedTime =
				(await modifiedTimeMeta.count()) > 0 ? await modifiedTimeMeta.getAttribute("content") : undefined;

			expect(title).toBeTruthy();
			expect(canonical).toBeTruthy();
			await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
			expect(publishedTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
			expect(Number.isNaN(Date.parse(publishedTime ?? ""))).toBe(false);

			if (modifiedTime) {
				expect(Number.isNaN(Date.parse(modifiedTime))).toBe(false);
			}

			const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
			expect(jsonLd).toBeTruthy();

			const data = JSON.parse(jsonLd ?? "{}") as {
				"@type"?: string;
				headline?: string;
				url?: string;
				datePublished?: string;
				dateModified?: string;
			};
			expect(data["@type"]).toBe("BlogPosting");
			expect(data.headline).toBe(title?.trim());
			expect(data.url).toBe(canonical);
			expect(data.datePublished).toBe(publishedTime);
			if (modifiedTime) {
				expect(data.dateModified).toBe(modifiedTime);
			}
		});
	}
});
