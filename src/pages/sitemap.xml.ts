import { allAnime, canonicalPath, genreIndex, seasonIndex, watchOrderIndex } from "@/lib/anime";
import { discoveryClusters } from "@/lib/discovery-clusters";
import { qualityWatchOrderGuides } from "@/lib/manual-content";
import { publicAnimeDetailPages, publicNextEpisodeAnime, qualifiedAnimeLikePages } from "@/lib/quality";
import { animeLikeSlug, nextEpisodeSlug } from "@/lib/search-intents";

const staticPages = [
  "/",
  "/calendar/",
  "/binge-planner/",
  "/watch-next/",
  "/finished-anime/",
  "/discover/",
  "/similar/",
  "/anime-like/",
  "/next-episode/",
  "/watch-order/",
  "/rankings/",
  "/watchlist/",
  "/about/",
  "/contact/",
  "/privacy/",
  "/terms/",
  "/affiliate-disclosure/"
];

export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const seenAnimeLike = new Set<string>();
  const animeLikeUrls = qualifiedAnimeLikePages(allAnime)
    .map((anime) => animeLikeSlug(anime))
    .filter((slug): slug is string => {
      if (!slug || seenAnimeLike.has(slug)) return false;
      seenAnimeLike.add(slug);
      return true;
    })
    .map((slug) => `/anime-like/${slug}/`);
  const seenNextEpisode = new Set<string>();
  const nextEpisodeUrls = publicNextEpisodeAnime(allAnime)
    .flatMap((anime) => {
      const slug = nextEpisodeSlug(anime);
      if (!slug || seenNextEpisode.has(slug)) return [];
      seenNextEpisode.add(slug);
      return [`/next-episode/${slug}/`];
    });
  const urls = [
    ...staticPages,
    ...discoveryClusters.map((cluster) => `/discover/${cluster.slug}/`),
    ...publicAnimeDetailPages(allAnime).map((anime) => `/anime/${anime.slug}/`),
    ...animeLikeUrls,
    ...nextEpisodeUrls,
    ...qualityWatchOrderGuides(watchOrderIndex.items).map((guide) => `/watch-order/${guide.slug}/`),
    ...genreIndex.items.map((genre) => `/genres/${genre.slug}/`),
    ...seasonIndex.items.map((season) => `/seasons/${season.seasonYear}/${season.season.toLowerCase()}/`)
  ];

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
