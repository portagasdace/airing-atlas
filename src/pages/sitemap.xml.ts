import { allAnime, canonicalPath, genreIndex, recommendationsFor, seasonIndex, watchOrderIndex } from "@/lib/anime";
import { discoveryClusters } from "@/lib/discovery-clusters";
import { manualFeaturedAnimeIds, qualityWatchOrderGuides } from "@/lib/manual-content";
import { publicNextEpisodeAnime } from "@/lib/quality";
import { animeLikeSlug, nextEpisodeSlug } from "@/lib/search-intents";

const staticPages = [
  "/",
  "/calendar/",
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
const blockedAnimeLikeFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL"]);

export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const seenAnimeLike = new Set<string>();
  const curatedAnimeLike = manualFeaturedAnimeIds
    .map((id) => allAnime.find((anime) => anime.id === id))
    .filter(Boolean) as typeof allAnime;
  const popularAnimeLike = allAnime
    .filter((anime) => recommendationsFor(anime.id).length >= 3 && !blockedAnimeLikeFormats.has(String(anime.format || "").toUpperCase()))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 140);
  const animeLikeUrls = [...curatedAnimeLike, ...popularAnimeLike]
    .filter((anime, index, items) => items.findIndex((item) => item.id === anime.id) === index)
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
    ...allAnime.map((anime) => `/anime/${anime.slug}/`),
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
