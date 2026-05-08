import { describe, expect, it } from "vitest";
import { absoluteUrl, formatDate, resolveTitle, serializeDate } from "../../src/lib/seo";
import { SITE } from "../../src/site";

describe("seo helpers", () => {
	describe("resolveTitle", () => {
		it("returns the site name when no title is given", () => {
			expect(resolveTitle()).toBe(SITE.name);
		});

		it("appends the site name to a page title", () => {
			expect(resolveTitle("About")).toBe(`About | ${SITE.name}`);
		});
	});

	describe("absoluteUrl", () => {
		it("resolves a relative path against the site origin", () => {
			expect(absoluteUrl("/about/")).toBe(`${SITE.url}/about/`);
		});

		it("returns the input when it is already an absolute URL", () => {
			const url = new URL("https://example.com/foo");
			expect(absoluteUrl(url)).toBe("https://example.com/foo");
		});
	});

	describe("serializeDate", () => {
		it("returns ISO string for Date instances", () => {
			expect(serializeDate(new Date("2025-01-15T00:00:00Z"))).toBe("2025-01-15T00:00:00.000Z");
		});

		it("returns undefined for invalid input", () => {
			expect(serializeDate("not-a-date")).toBeUndefined();
			expect(serializeDate(undefined)).toBeUndefined();
		});
	});

	describe("formatDate", () => {
		it("formats a date in en-US long form", () => {
			expect(formatDate(new Date("2025-01-15T00:00:00Z"))).toBe("January 15, 2025");
		});
	});
});
