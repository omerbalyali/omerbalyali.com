import { expect, test } from "@playwright/test";

test.describe("Plausible opt-out control", () => {
	test("toggles and persists the analytics preference", async ({ page }) => {
		await page.goto("/privacy-policy/");

		const status = page.locator("[data-plausible-opt-out-status]");
		const button = page.getByRole("button", { name: "Opt out of analytics" });

		await expect(status).toHaveText("Plausible Analytics is currently enabled in this browser.");
		await expect(button).toBeEnabled();
		await expect(button).toHaveAttribute("aria-pressed", "false");

		await button.click();
		await expect(status).toHaveText("Plausible Analytics is currently disabled in this browser.");
		await expect(page.getByRole("button", { name: "Allow analytics" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await expect.poll(() => page.evaluate(() => localStorage.getItem("plausible_ignore"))).toBe("true");

		await page.reload();
		await expect(status).toHaveText("Plausible Analytics is currently disabled in this browser.");
		await expect(page.getByRole("button", { name: "Allow analytics" })).toHaveAttribute(
			"aria-pressed",
			"true",
		);

		await page.getByRole("button", { name: "Allow analytics" }).click();
		await expect(status).toHaveText("Plausible Analytics is currently enabled in this browser.");
		await expect.poll(() => page.evaluate(() => localStorage.getItem("plausible_ignore"))).toBeNull();
	});
});
