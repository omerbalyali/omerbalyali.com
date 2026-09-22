import { expect, test } from "@playwright/test";

test("header branding stays accessible and updates when navigating home and back", async ({ page }) => {
	await page.goto("/");
	const brand = page.getByRole("banner").getByRole("link", { name: "Ömer Balyalı", exact: true });
	const name = brand.getByText("Ömer Balyalı", { exact: true });

	await expect(brand).toBeVisible();
	await expect(brand).toHaveAttribute("href", "/");
	// The homepage shows only the logo, but its link still has an accessible name.
	await expect(name).toHaveCSS("clip-path", "inset(50%)");

	await page
		.getByRole("navigation", { name: "Legal", exact: true })
		.getByRole("link", { name: "Privacy Policy" })
		.click();
	await expect(page).toHaveURL("/privacy-policy/");
	await expect(name).toBeVisible();
	await expect(name).toHaveCSS("clip-path", "none");

	await brand.focus();
	await page.keyboard.press("Enter");
	await expect(page).toHaveURL("/");
	await expect(name).toHaveCSS("clip-path", "inset(50%)");

	await page.goBack();
	await expect(page).toHaveURL("/privacy-policy/");
	await expect(name).toHaveCSS("clip-path", "none");
});
