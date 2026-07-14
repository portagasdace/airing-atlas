import { allAnime, canonicalPath, watchOrderIndex } from "@/lib/anime";
import { discoveryClusters } from "@/lib/discovery-clusters";
import { guides } from "@/lib/guides";
import { adsenseReviewAnimeLikePages, adsenseReviewWatchOrderGuides } from "@/lib/quality";
import { ADSENSE_REVIEW_DISCOVER_SLUGS } from "@/lib/review-mode";
import { animeLikeSlug } from "@/lib/search-intents";

const staticPages = [
  "/",
  "/about/",
  "/editorial-policy/",
  "/guides/",
  "/anime-finder/",
  "/binge-planner/",
  "/watch-next/",
  "/anime-like/",
  "/watch-order/"
];

export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const seenAnimeLike = new Set<string>();
  const animeLikeUrls = adsenseReviewAnimeLikePages(allAnime)
    .map((anime) => animeLikeSlug(anime))
    .filter((slug): slug is string => {
      if (!slug || seenAnimeLike.has(slug)) return false;
      seenAnimeLike.add(slug);
      return true;
    })
    .map((slug) => `/anime-like/${slug}/`);
  const urls = [
    ...staticPages,
    ...guides.map((guide) => `/guides/${guide.slug}/`),
    ...discoveryClusters
      .filter((cluster) => ADSENSE_REVIEW_DISCOVER_SLUGS.includes(cluster.slug as (typeof ADSENSE_REVIEW_DISCOVER_SLUGS)[number]))
      .map((cluster) => `/discover/${cluster.slug}/`),
    ...animeLikeUrls,
    ...adsenseReviewWatchOrderGuides(watchOrderIndex.items).map((guide) => `/watch-order/${guide.slug}/`)
  ].filter(uniquePath);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${canonicalPath(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}

function uniquePath(value: string, index: number, items: string[]): boolean {
  return items.indexOf(value) === index;
}
