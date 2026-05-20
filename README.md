# omerbalyali.com

Source for [omerbalyali.com](https://omerbalyali.com), built with [Astro](https://astro.build/) and deployed to Cloudflare.

## Setup

This project uses Node.js 24+ and pnpm.

```sh
pnpm install
pnpm exec playwright install chromium
```

For Cloudflare binding/type updates, run:

```sh
pnpm run types:cf
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
pnpm run test:e2e    # Main Playwright smoke/behavior tests
pnpm run test:a11y   # Playwright accessibility checks
```

## Testing

The test suite combines:

- Vitest unit tests for utility functions.
- Playwright route, metadata, navigation, feed, and interaction tests.
- Axe-powered accessibility checks for public routes in the sitemap.

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
