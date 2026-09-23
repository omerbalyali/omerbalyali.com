import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { selectScheme } from "./_appearance";
import { missingRoute, routes, workDetailRoutes } from "./_fixtures";

// `astro preview` doesn't apply dist/_headers, so serve every document with the policy the build
// generated there (integrations/csp.ts), the way Cloudflare will.
const headers = readFileSync(resolve(process.cwd(), "dist/_headers"), "utf8");
const policy = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1];

async function enforcePolicy(page: Page) {
	expect(policy, "dist/_headers should contain a generated Content-Security-Policy").toBeTruthy();
	await page.route("**/*", async (route) => {
		if (route.request().resourceType() !== "document") return route.continue();
		const response = await route.fetch();
		await route.fulfill({ response, headers: { ...response.headers(), "content-security-policy": policy! } });
	});
	await page.addInitScript(() => {
		const violations: string[] = [];
		Object.assign(window, { __cspViolations: violations });
		document.addEventListener("securitypolicyviolation", (event) => {
			violations.push(
				`${event.effectiveDirective} blocked ${event.blockedURI || "inline"} (${event.sample})`,
			);
		});
	});
}

const violations = (page: Page) =>
	page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);

test.describe("content security policy", () => {
	test.beforeEach(async ({ page }) => enforcePolicy(page));

	for (const route of [...routes, ...workDetailRoutes, missingRoute]) {
		test(`${route} loads without violations`, async ({ page }) => {
			await page.goto(route);
			await page.waitForLoadState("networkidle");
			expect(await violations(page)).toEqual([]);
		});
	}

	test("client-side navigation and the appearance menu run without violations", async ({ page }) => {
		await page.goto("/");
		await selectScheme(page, "Dark");
		await page.locator('a[href="/writing/rethinking-accessibility/"]').first().click();
		await expect(page).toHaveURL(/rethinking-accessibility/);
		await page.locator('a[href="/"]').first().click();
		await expect(page).toHaveURL(/\/$/);
		await selectScheme(page, "System");
		expect(await violations(page)).toEqual([]);
	});

	test("interactive work components run without violations", async ({ page }) => {
		await page.goto("/works/keepspace/");
		const slider = page.getByRole("slider").first();
		await slider.focus();
		await page.keyboard.press("ArrowRight");
		await page.keyboard.press("Home");
		expect(await violations(page)).toEqual([]);
	});
});
