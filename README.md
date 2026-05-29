# Airing Atlas

An English anime calendar and tracking MVP built with Astro, TypeScript, and Firebase Hosting.

## What is included

- Seasonal anime calendar with local-time display
- Shareable binge planner with stable URL plans
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

## GitHub Actions update

The workflow at `.github/workflows/daily-update.yml` runs every 4 hours and whenever `main` is pushed. It syncs live AniList data, builds the Astro site, runs the quality audit, and deploys Firebase Hosting.

Before it can deploy from GitHub, add this repository secret:

- `FIREBASE_SERVICE_ACCOUNT_AIRING_ATLAS`: JSON key for a Firebase service account that can deploy Hosting for project `airing-atlas`.

You can also run it manually in GitHub from `Actions` -> `Daily Airing Atlas Update` -> `Run workflow`.

Regenerate the favicon after editing `scripts/generate-favicon.mjs`:

```bash
pnpm run favicon
```

## Analytics workflow

Production uses GA4 measurement ID `G-7LC772Z7PH`. Keep Firebase, GA4, GitHub Actions, and local deploy commands on the same `PUBLIC_GA_MEASUREMENT_ID` so reports do not split across properties.

Before owner testing, opt this browser out of Analytics:

```js
localStorage.setItem("airingAtlasAnalyticsOptOut", "true")
```

To turn tracking back on in that browser:

```js
localStorage.removeItem("airingAtlasAnalyticsOptOut")
```

Configure these GA4 custom dimensions from event parameters:

- `content_type`
- `guide_type`
- `source_section`
- `audience_type`
- `trigger_event`
- `anime_id`
- `result_position`
- `local_watchlist_items`
- `local_saved_plans`

Configure these GA4 user-scoped custom dimensions from user properties:

- `primary_audience`
- `returning_local_user`
- `has_watchlist`
- `has_saved_plans`

Mark these events as key events once they appear in GA4:

- `binge_plan_generate`
- `binge_plan_share_copy`
- `binge_plan_save`
- `binge_plan_add_all_watchlist`
- `watchlist_add`
- `discover_result_click`
- `anime_like_result_click`
- `next_episode_detail_click`

Use scroll events such as `scroll_depth_50` and `scroll_depth_90` as quality signals, not key events.

The Firebase/GA Audience hub should eventually replace the default `Purchasers` audience with Airing Atlas-specific audiences. Build them from `audience_signal` or direct events:

- `Planner builders`: `audience_type = planner`, or users who trigger `binge_plan_generate`, `binge_plan_save`, or `binge_plan_share_copy`.
- `Watchlist users`: `audience_type = watchlist`, or users with `watchlist_add`, `saved_plan_open`, or `has_watchlist = true`.
- `Discovery users`: `audience_type = discovery`, or users with `discover_result_click`, `anime_like_result_click`, or `similar_result_click`.
- `Schedule trackers`: `audience_type = schedule`, or users with `next_episode_detail_click` or repeated calendar / next episode page views.
- `Guide readers`: `audience_type = guide`, or users with watch order guide clicks and high scroll depth.

## Search Console workflow

Every week, export Search Console Queries, Pages, and Indexing CSV files into `reports/search-console/`, then run:

```bash
pnpm run seo:opportunities
```

Use the generated backlog to make 5-10 focused changes: rewrite titles for impression-heavy low-CTR pages, improve or noindex crawled-but-not-indexed pages, and only create new guides when queries show demand.

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
