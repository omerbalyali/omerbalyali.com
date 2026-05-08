import { expect, test } from "@playwright/test";
import { routes } from "./_fixtures";

test.describe("page smoke", () => {
	for (const route of routes) {
		test(`${route} responds with 200, has title, canonical, and a reachable og:image`, async ({
			page,
			request,
		}) => {
			const response = await page.goto(route);
			expect(response?.status()).toBe(200);

			await expect(page).toHaveTitle(/.+/);

			const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
			expect(canonical, "canonical link should be present").toBeTruthy();

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
});
