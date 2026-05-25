import { allAnime, canonicalPath } from "@/lib/anime";

const staticPages = [
  "/",
  "/calendar/",
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
    ...allAnime.map((anime) => `/anime/${anime.slug}/`)
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
