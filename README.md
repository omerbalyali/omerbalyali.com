# omerbalyali.com

Source for [omerbalyali.com](https://omerbalyali.com), built with [Astro](https://astro.build/) and deployed to Cloudflare.

## Setup

This project uses Node.js 24+ and pnpm.

```sh
pnpm install
pnpm exec playwright install chromium
```

## Development

```sh
pnpm run dev
```

To preview on another device on the same local network:

```sh
pnpm run dev:lan
```

HTTPS is optional for local development. Use it only when testing browser features that require a secure context:

```sh
pnpm run dev:lan:https
```

This expects local certificate files named `localhost.pem` and `localhost-key.pem`.

## Common Commands

```sh
pnpm run check       # Astro type/content checks
pnpm run lint        # Astro check, Prettier check, and Stylelint
pnpm run format      # Format files with Prettier
pnpm run build       # Build the site
pnpm run preview     # Preview the built site locally
pnpm run test        # Build, unit tests, and Playwright tests
pnpm run test:unit   # Unit tests only
pnpm run test:e2e    # All Playwright tests (smoke, behavior, and accessibility)
pnpm run test:a11y   # Playwright accessibility checks
```

## Browser Support

The site targets current evergreen browsers with Safari 17 / iOS 17 as the baseline. CSS is compiled with Lightning CSS for that target (see `vite.css.lightningcss.targets` in `astro.config.ts`).

## Fonts

Web fonts are subset to Latin and Latin Extended, like Google Fonts. Only upright Latin Inter is preloaded; the other files load when a page uses their characters. The full source files live in `src/assets/fonts/source/`. After replacing them, regenerate the subsets (needs `pyftsubset` from `brew install fonttools`):

```sh
./scripts/subset-fonts.sh
```

The Unicode ranges are defined in both the script and `src/lib/fonts.ts`; keep them in sync.

## Security Headers

`public/_headers` sets the static security headers. The Content-Security-Policy is generated at build time by `integrations/csp.ts`, which hashes every inline script and style in the built pages and appends the policy to `dist/_headers`. `tests/e2e/csp.spec.ts` checks the site works under it.

## Deployment

- Pushes to `main` build, test, and deploy to production (`.github/workflows/deploy.yml`).
- Each pull request uploads a version of the `preview-omerbalyali-com` Worker with its own preview URL, `pr-<number>-preview-omerbalyali-com.<subdomain>.workers.dev`, linked in the workflow summary. This needs the `CLOUDFLARE_WORKERS_SUBDOMAIN` repository variable and preview URLs enabled on the preview Worker.

Non-production builds are marked `noindex` and disallowed in `robots.txt`.

## Testing

The test suite combines:

- Vitest unit tests for utility functions.
- Playwright route, metadata, navigation, feed, and interaction tests.
- Axe-powered accessibility checks for sitemap routes, work detail pages, and the 404 page.

Most Playwright tests run against `astro preview`, so run `pnpm run build` first when executing individual e2e specs manually.

## Updating Dependencies

```sh
pnpm dlx @astrojs/upgrade
pnpm outdated
pnpm update
pnpm run test
```

For major upgrades, review changelogs first, especially for Astro, Cloudflare/Wrangler, Playwright, and Stylelint.

## License

This repository is source-available for reference. It is not open source and no license is granted to copy, modify, redistribute, or reuse the code or content.

Copyright © 2026 Ömer Balyalı. All rights reserved.
