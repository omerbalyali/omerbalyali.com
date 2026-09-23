import { expect, test, type Page } from "@playwright/test";

import { selectScheme } from "./_appearance";

const article = "/writing/the-eslint-logo-story/";

/** Every URL a `srcset` (or plain `src`) offers; the browser picks one by screen size. */
function candidateUrls(srcset: string, base: string) {
	return srcset.split(",").map((candidate) => new URL(candidate.trim().split(/\s+/)[0], base).href);
}

async function expectVariant(page: Page, variant: "light" | "dark") {
	const pictures = page.locator("picture").filter({ has: page.locator("source[data-scheme-dark]") });
	await expect(pictures.first()).toBeAttached();
	for (const picture of await pictures.all()) {
		const img = picture.locator("img");
		await img.scrollIntoViewIfNeeded();
		const source =
			variant === "dark"
				? await picture.locator("source[data-scheme-dark]").getAttribute("srcset")
				: ((await img.getAttribute("srcset")) ?? (await img.getAttribute("src")));
		expect(source).toBeTruthy();
		const expectedUrls = candidateUrls(source!, page.url());
		await expect
			.poll(async () => {
				const { loaded, src } = await img.evaluate((element: HTMLImageElement) => ({
					loaded: element.complete && element.naturalWidth > 0,
					src: element.currentSrc,
				}));
				return loaded && expectedUrls.includes(src) ? "loaded expected variant" : `${loaded} ${src}`;
			})
			.toBe("loaded expected variant");
	}
}

test("article pictures follow explicit preferences and live system changes", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto(article);
	await expectVariant(page, "light");
	const singleImage = page.locator("figure > img").first();
	const originalSource = await singleImage.getAttribute("src");
	await selectScheme(page, "Dark");
	await expectVariant(page, "dark");
	await page.reload();
	await expectVariant(page, "dark");
	await page.emulateMedia({ colorScheme: "dark" });
	await selectScheme(page, "Light");
	await expectVariant(page, "light");
	await selectScheme(page, "System");
	await expectVariant(page, "dark");
	await page.emulateMedia({ colorScheme: "light" });
	await expectVariant(page, "light");
	await expect(singleImage).toHaveAttribute("src", originalSource!);
});

test("pictures receive the saved choice on Astro navigation and updates from another tab", async ({
	page,
	context,
}) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/");
	await selectScheme(page, "Dark");
	await page.locator(`a[href="${article}"]`).first().click();
	await expect(page).toHaveURL(article);
	await expectVariant(page, "dark");
	const other = await context.newPage();
	await other.goto("/");
	await selectScheme(other, "Light");
	await expectVariant(page, "light");
});

test.describe("without JavaScript", () => {
	test.use({ javaScriptEnabled: false, colorScheme: "dark" });
	test("pictures retain the system fallback", async ({ page }) => {
		await page.goto(article);
		await expectVariant(page, "dark");
		await page.emulateMedia({ colorScheme: "light" });
		await expectVariant(page, "light");
	});
});
