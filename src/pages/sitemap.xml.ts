import { allAnime, canonicalPath, genreIndex, recommendationsFor, seasonIndex, watchOrderIndex } from "@/lib/anime";
import { animeLikeSlugCandidates, nextEpisodeSlug } from "@/lib/search-intents";

const staticPages = [
  "/",
  "/calendar/",
  "/discover/",
  "/similar/",
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
  const animeLikeUrls = allAnime
    .filter((anime) => recommendationsFor(anime.id).length >= 3)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 140)
    .flatMap((anime) => animeLikeSlugCandidates(anime).slice(0, 2))
    .filter((slug) => {
      if (!slug || seenAnimeLike.has(slug)) return false;
      seenAnimeLike.add(slug);
      return true;
    })
    .map((slug) => `/anime-like/${slug}/`);
  const seenNextEpisode = new Set<string>();
  const nextEpisodeUrls = allAnime
    .filter((anime) => anime.nextAiringEpisode?.airingAt)
    .sort((a, b) => (a.nextAiringEpisode?.airingAt || 0) - (b.nextAiringEpisode?.airingAt || 0))
    .flatMap((anime) => {
      const slug = nextEpisodeSlug(anime);
      if (!slug || seenNextEpisode.has(slug)) return [];
      seenNextEpisode.add(slug);
      return [`/next-episode/${slug}/`];
    });
  const urls = [
    ...staticPages,
    ...allAnime.map((anime) => `/anime/${anime.slug}/`),
    ...animeLikeUrls,
    ...nextEpisodeUrls,
    ...watchOrderIndex.items.map((guide) => `/watch-order/${guide.slug}/`),
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
