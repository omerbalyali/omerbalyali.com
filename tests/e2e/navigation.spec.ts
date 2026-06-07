import { expect, test, type Page } from "@playwright/test";

const moreButton = (page: Page) => page.getByRole("button", { name: "More links" });
const nav = (page: Page) => page.getByRole("navigation", { name: "Primary" });

async function visiblePrimaryLinks(page: Page) {
	return page
		.locator(".navbar-item")
		.evaluateAll((items) =>
			items
				.filter((item) => getComputedStyle(item).display !== "none")
				.map((item) => item.textContent?.trim() || item.querySelector("a")?.getAttribute("aria-label") || ""),
		);
}

async function visibleMenuLinks(page: Page) {
	return page
		.locator(".navbar-menu-item")
		.evaluateAll((items) =>
			items
				.filter((item) => getComputedStyle(item).display !== "none")
				.map((item) => item.textContent?.trim() || ""),
		);
}

async function visibleMenuHrefs(page: Page) {
	return page.locator(".navbar-menu-item").evaluateAll((items) =>
		items
			.filter((item) => getComputedStyle(item).display !== "none")
			.map((item) => {
				const anchor = item.querySelector("a");
				return {
					text: item.textContent?.trim() || "",
					href: anchor?.getAttribute("href") || "",
					target: anchor?.getAttribute("target"),
					rel: anchor?.getAttribute("rel"),
				};
			}),
	);
}

test.describe("primary navigation", () => {
	test("keeps page state and menu interactions accessible", async ({ page }) => {
		await page.goto("/writing/");

		await expect(nav(page).getByRole("link", { name: "Writing" }).first()).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(moreButton(page)).toHaveAttribute("aria-expanded", "false");

		await moreButton(page).click();
		await expect(moreButton(page)).toHaveAttribute("aria-expanded", "true");
		await expect(page.locator(".navbar-menu")).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(moreButton(page)).toHaveAttribute("aria-expanded", "false");

		await moreButton(page).click();
		await page.locator("main").click();
		await expect(moreButton(page)).toHaveAttribute("aria-expanded", "false");
	});

	test("moves lower priority links into the menu at narrow widths", async ({ page }) => {
		await page.goto("/writing/");

		await page.setViewportSize({ width: 500, height: 700 });
		await expect.poll(() => visiblePrimaryLinks(page)).toEqual(["Home", "Works", "Writing", "About"]);
		await moreButton(page).click();
		await expect.poll(() => visibleMenuLinks(page)).not.toContain("Writing");
		await expect.poll(() => visibleMenuLinks(page)).not.toContain("About");
		const desktopMenuLinks = await visibleMenuHrefs(page);
		expect(
			desktopMenuLinks.every(
				(link) =>
					link.href.startsWith("https://") && link.target === "_blank" && link.rel === "noopener noreferrer",
			),
		).toBe(true);

		await page.setViewportSize({ width: 389, height: 700 });
		await expect.poll(() => visiblePrimaryLinks(page)).toEqual(["Home", "Works", "Writing"]);
		await expect.poll(() => visibleMenuLinks(page)).toContain("About");

		await page.setViewportSize({ width: 319, height: 700 });
		await expect.poll(() => visiblePrimaryLinks(page)).toEqual(["Home"]);
		await expect
			.poll(() => visibleMenuLinks(page))
			.toEqual(expect.arrayContaining(["Works", "Writing", "About"]));

		await expect(nav(page).getByRole("link", { name: "Writing" }).last()).toHaveAttribute(
			"aria-current",
			"page",
		);
	});
});
