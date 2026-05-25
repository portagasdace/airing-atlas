# Airing Atlas

An English anime calendar and tracking MVP built with Astro, TypeScript, and Firebase Hosting.

## What is included

- Seasonal anime calendar with local-time display
- Static anime detail pages generated at build time
- Rankings for trending, popular, top rated, and current season anime
- Browser-only watchlist stored in `localStorage`
- AdSense-safe ad placeholders and affiliate disclosure surfaces
- Privacy, terms, contact, about, and affiliate disclosure pages
- AniList sync script with fixture fallback for offline development
- Firebase Hosting and Cloud Build config

## Local development

```bash
pnpm install
pnpm run sync
pnpm run dev
```

## Production build

```bash
pnpm run sync
pnpm run build
```

## Manual update and deploy

Run this when you want to refresh today's anime data and publish the site:

```bash
LIVE_ANILIST_REQUIRED=true pnpm run sync
pnpm run build
pnpm dlx firebase-tools deploy --only hosting --project airing-atlas
```

## Daily GitHub Actions update

The workflow at `.github/workflows/daily-update.yml` runs every day at 10:00 Asia/Shanghai time and whenever `main` is pushed. It syncs live AniList data, builds the Astro site, and deploys Firebase Hosting.

Before it can deploy from GitHub, add this repository secret:

- `FIREBASE_SERVICE_ACCOUNT_AIRING_ATLAS`: JSON key for a Firebase service account that can deploy Hosting for project `airing-atlas`.

You can also run it manually in GitHub from `Actions` -> `Daily Airing Atlas Update` -> `Run workflow`.

Regenerate the favicon after editing `scripts/generate-favicon.mjs`:

```bash
pnpm run favicon
```

## Environment variables

- `ANILIST_API_ENDPOINT`: defaults to `https://graphql.anilist.co`.
- `PUBLIC_SITE_URL`: canonical site URL, defaults to `https://airingatlas.com`.
- `PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 web stream ID, for example `G-XXXXXXXXXX`.
- `PUBLIC_ADSENSE_CLIENT_ID`: when set, the layout loads AdSense and ad slots render `<ins>` containers.
- `PUBLIC_AFFILIATE_DISCLOSURE_ENABLED`: defaults to `true`.
- `LIVE_ANILIST_REQUIRED=true`: fail the sync if AniList cannot be reached instead of using fixtures.

## Google deployment notes

1. Create a Firebase project and enable Hosting.
2. Replace `_FIREBASE_PROJECT_ID` in `cloudbuild.yaml`.
3. Connect Cloud Build to the repository.
4. Add a Cloud Scheduler trigger that runs the Cloud Build trigger once per day.
5. Submit the deployed domain in Google Search Console.
6. Apply for AdSense only after the public pages, policy pages, and original editorial sections are live.

This project intentionally avoids video hosting, download links, unauthorized manga scans, and adult content.
