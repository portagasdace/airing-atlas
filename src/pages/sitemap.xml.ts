import { allAnime, canonicalPath, genreIndex, seasonIndex, watchOrderIndex } from "@/lib/anime";

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
  const urls = [
    ...staticPages,
    ...allAnime.map((anime) => `/anime/${anime.slug}/`),
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
