import type { Page } from "@playwright/test";

export async function selectScheme(page: Page, choice: "Light" | "Dark" | "System") {
	await page.getByRole("button", { name: /^Appearance:/ }).click();
	await page.getByRole("menuitemradio", { name: choice, exact: true }).click();
}
