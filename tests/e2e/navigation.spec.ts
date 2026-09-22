import { expect, test } from "@playwright/test";

test.describe("footer navigation", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("legal links remain usable on mobile", async ({ page }) => {
		await page.goto("/");
		const legal = page.getByRole("navigation", { name: "Legal", exact: true });
		for (const [label, path] of [
			["Accessibility", "/accessibility/"],
			["Privacy Policy", "/privacy-policy/"],
			["Legal Notice", "/legal-notice/"],
		]) {
			await legal.getByRole("link", { name: label, exact: true }).click();
			await expect(page).toHaveURL(path);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		}
		await expect(legal.getByRole("link", { name: "RSS", exact: true })).toHaveAttribute("href", "/rss.xml");
	});

	test("social links have accessible names and safe external targets", async ({ page }) => {
		await page.goto("/");
		const links = page.getByRole("navigation", { name: "Social", exact: true }).getByRole("link");
		await expect(links.first()).toBeVisible();
		for (const link of await links.all()) {
			await expect(link).toHaveAccessibleName(/\S/);
			await expect(link).toHaveAttribute("href", /^https:\/\//);
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", /\bnoopener\b/);
			await expect(link).toHaveAttribute("rel", /\bnoreferrer\b/);
		}
	});
});
