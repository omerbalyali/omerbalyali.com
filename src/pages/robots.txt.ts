import type { APIRoute } from "astro";
import { SITE } from "../site";

export const GET: APIRoute = ({ site }) => {
	const origin = site ?? new URL(SITE.url);
	const body = ["User-agent: *", "Allow: /", `Sitemap: ${new URL("/sitemap-index.xml", origin).href}`].join(
		"\n",
	);

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
