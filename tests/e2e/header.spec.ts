import { expect, test } from "@playwright/test";

const header = ".app-header";
const intro = ".app-header .intro";

test.describe("app header", () => {
	test("shows the intro only on the home page", async ({ page }) => {
		await page.goto("/");

		await expect(page.locator(header)).toHaveAttribute("data-intro-visible", "");
		await expect(page.locator(intro)).not.toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(intro)).not.toHaveAttribute("inert", "");

		await page.goto("/about/");

		await expect(page.locator(header)).not.toHaveAttribute("data-intro-visible", "");
		await expect(page.locator(intro)).toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(intro)).toHaveAttribute("inert", "");
	});

	test("updates the intro state after client-side navigation", async ({ page }) => {
		await page.goto("/");

		await page.getByRole("link", { name: "Works" }).first().click();
		await expect(page).toHaveURL(/\/works\/$/);

		await expect(page.locator(header)).not.toHaveAttribute("data-intro-visible", "");
		await expect(page.locator(intro)).toHaveAttribute("aria-hidden", "true");
		await expect(page.locator(intro)).toHaveAttribute("inert", "");
	});
});
