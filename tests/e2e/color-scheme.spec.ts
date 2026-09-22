import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { selectScheme } from "./_appearance";

test.describe("appearance menu", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("supports keyboard navigation and accessible semantics", async ({ page }) => {
		const trigger = page.getByRole("button", { name: "Appearance: System" });
		await trigger.focus();
		await page.keyboard.press("Enter");
		await expect(page.getByRole("menuitemradio", { name: "Light" })).toBeFocused();
		await expect(page.getByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true");
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		const results = await new AxeBuilder({ page }).include("color-scheme-picker").analyze();
		expect(results.violations).toEqual([]);
		for (const [key, option] of [
			["End", "System"],
			["ArrowDown", "Light"],
			["ArrowUp", "System"],
			["Home", "Light"],
			["d", "Dark"],
		]) {
			await page.keyboard.press(key);
			await expect(page.getByRole("menuitemradio", { name: option })).toBeFocused();
		}
	});

	test("keyboard selection saves the choice and restores focus", async ({ page }) => {
		await page.getByRole("button", { name: "Appearance: System" }).focus();
		await page.keyboard.press("ArrowUp");
		await expect(page.getByRole("menuitemradio", { name: "System" })).toBeFocused();
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("Space");
		await expect(page.locator("html")).toHaveAttribute("data-scheme-preference", "dark");
		await expect(page.getByRole("menu")).toBeHidden();
		const trigger = page.getByRole("button", { name: "Appearance: Dark" });
		await expect(trigger).toBeFocused();
		await trigger.click();
		await expect(page.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
		await expect(page.getByRole("menuitemradio", { name: "System" })).toHaveAttribute(
			"aria-checked",
			"false",
		);
	});

	for (const method of ["Escape", "Tab", "Shift+Tab", "trigger", "outside"] as const) {
		test(`dismisses with ${method}`, async ({ page }) => {
			const trigger = page.getByRole("button", { name: "Appearance: System" });
			await trigger.click();
			await expect(page.getByRole("menu")).toBeVisible();
			if (method === "trigger") await trigger.click();
			else if (method === "outside") await page.locator("main p").first().click();
			else await page.keyboard.press(method);
			await expect(page.getByRole("menu")).toBeHidden();
			await expect(trigger).toHaveAttribute("aria-expanded", "false");
			if (method === "Escape" || method === "Shift+Tab" || method === "trigger")
				await expect(trigger).toBeFocused();
			if (method === "Tab") await expect(page.locator("color-scheme-picker :focus")).toHaveCount(0);
		});
	}
});

test("persists explicit choices, follows system changes, and survives client navigation", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.goto("/");
	const root = page.locator("html");
	await expect(root).toHaveAttribute("data-scheme-preference", "system");
	await expect(root).toHaveAttribute("data-scheme", "dark");
	await expect(root).toHaveCSS("color-scheme", "dark");
	await page.emulateMedia({ colorScheme: "light" });
	await expect(root).toHaveAttribute("data-scheme", "light");
	await expect(root).toHaveCSS("color-scheme", "light");
	await selectScheme(page, "Dark");
	expect(await page.evaluate(() => localStorage.getItem("color-scheme"))).toBe("dark");
	await page.emulateMedia({ colorScheme: "dark" });
	await page.emulateMedia({ colorScheme: "light" });
	await expect(root).toHaveAttribute("data-scheme", "dark");
	await page.reload();
	await expect(root).toHaveAttribute("data-scheme-preference", "dark");
	// Exercise Astro's actual client router, including a replaced header component.
	await page.locator('a[href="/writing/rethinking-accessibility/"]').first().click();
	await expect(page).toHaveURL(/rethinking-accessibility/);
	await expect(root).toHaveAttribute("data-scheme-preference", "dark");
	await selectScheme(page, "Light");
	await expect(root).toHaveAttribute("data-scheme", "light");
	await selectScheme(page, "System");
	await page.emulateMedia({ colorScheme: "dark" });
	await expect(root).toHaveAttribute("data-scheme", "dark");
	await expect(root).toHaveAttribute("data-theme", "default");
	await page.reload();
	await expect(root).toHaveAttribute("data-scheme-preference", "system");
});

test("synchronizes across tabs, including clearing storage and invalid values", async ({ page, context }) => {
	await page.goto("/");
	const other = await context.newPage();
	await other.goto("/");
	await selectScheme(page, "Dark");
	await expect(other.getByRole("button", { name: "Appearance: Dark" })).toBeVisible();
	await page.evaluate(() => localStorage.clear());
	await expect(other.locator("html")).toHaveAttribute("data-scheme-preference", "system");
	await page.evaluate(() => localStorage.setItem("color-scheme", "invalid"));
	await other.reload();
	await expect(other.locator("html")).toHaveAttribute("data-scheme-preference", "system");
});

test("storage denial preserves a working session preference and announces the limitation", async ({
	page,
}) => {
	await page.addInitScript(() => {
		Object.defineProperty(window, "localStorage", {
			get() {
				throw new Error("Storage blocked");
			},
		});
	});
	await page.goto("/");
	await selectScheme(page, "Dark");
	await expect(page.locator("html")).toHaveAttribute("data-scheme-preference", "dark");
	await expect(page.getByRole("status")).toContainText("could not save");
	await page.locator('a[href="/writing/rethinking-accessibility/"]').first().click();
	await expect(page).toHaveURL(/rethinking-accessibility/);
	await expect(page.getByRole("button", { name: "Appearance: Dark" })).toBeVisible();
});

test.describe("mobile appearance menu", () => {
	test.use({ viewport: { width: 320, height: 640 }, hasTouch: true });
	test("fits the viewport and supports touch", async ({ page }) => {
		await page.goto("/");
		await page.getByRole("button", { name: "Appearance: System" }).tap();
		await expect(page.getByRole("menu")).toBeVisible();
		const box = await page.getByRole("menu").boundingBox();
		expect(box!.x).toBeGreaterThanOrEqual(0);
		expect(box!.x + box!.width).toBeLessThanOrEqual(320);
		await page.getByRole("menuitemradio", { name: "Light" }).tap();
		await expect(page.getByRole("button", { name: "Appearance: Light" })).toBeFocused();
	});
});
