import type { APIRoute } from "astro";
import { OG_SIZES, renderOgImage, type OgSize, type OgVariant } from "../../../lib/og";
import { discoverOgRoutes } from "../../../lib/og-pages";

export const prerender = true;

interface OgRouteProps extends Record<string, unknown> {
	variant: OgVariant;
	title?: string;
}

export async function getStaticPaths() {
	const sizes = Object.keys(OG_SIZES) as OgSize[];
	const routes = await discoverOgRoutes();

	return sizes.flatMap((size) =>
		routes.map((route) => ({
			params: { size, slug: route.slug },
			props: {
				variant: route.variant,
				title: route.title,
			} satisfies OgRouteProps,
		})),
	);
}

export const GET: APIRoute = async ({ params, props }) => {
	const size = params.size as OgSize;
	const { variant, title } = props as OgRouteProps;

	const png = await renderOgImage({ size, variant, title });

	return new Response(new Uint8Array(png), {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
