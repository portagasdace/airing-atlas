# Search Console CSV Workflow

Use this folder for local Google Search Console exports. The CSV files are ignored by git because they can contain private site performance data.

## Weekly export

1. Open Google Search Console for `https://airingatlas.com/`.
2. Export the last 7 or 28 days for Performance > Search results > Queries.
3. Save it as `reports/search-console/queries.csv`.
4. Export Performance > Search results > Pages.
5. Save it as `reports/search-console/pages.csv`.
6. Export Page indexing examples if available.
7. Save it as `reports/search-console/indexing.csv`.
8. Run `pnpm run seo:opportunities`.

The script writes:

- `reports/seo-opportunities.md`
- `reports/seo-opportunities.json`
- `reports/seo-backlog.md`
- `reports/seo-backlog.json`

## How to use the backlog

- Low CTR with impressions: rewrite the title, description, and first-screen copy.
- Crawled currently not indexed: add unique content or remove the URL from sitemap eligibility.
- Discovered currently not indexed: reduce weak internal links or improve the page before promoting it.
- New query intent: map it to an existing guide first; create a new curated page only when the query repeats.

Run `pnpm run seo:test` after changing the SEO script to verify CSV parsing and backlog generation with fixture data.
