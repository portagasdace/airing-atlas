import { allAnime, canonicalPath, watchOrderIndex } from "@/lib/anime";
import { discoveryClusters } from "@/lib/discovery-clusters";
import { guides } from "@/lib/guides";
import { publicAnimeDetailPages, publicAnimeLikePages, publicWatchOrderGuides } from "@/lib/quality";
import { animeLikeSlug } from "@/lib/search-intents";

const staticPages = [
  "/",
  "/about/",
  "/guides/",
  "/anime-finder/",
  "/calendar/",
  "/binge-planner/",
  "/watch-next/",
  "/finished-anime/",
  "/discover/",
  "/similar/",
  "/anime-like/",
  "/next-episode/",
  "/watch-order/"
];

export function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const seenAnimeLike = new Set<string>();
  const animeLikeUrls = publicAnimeLikePages(allAnime)
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
    ...discoveryClusters.map((cluster) => `/discover/${cluster.slug}/`),
    ...publicAnimeDetailPages(allAnime).map((anime) => `/anime/${anime.slug}/`),
    ...animeLikeUrls,
    ...publicWatchOrderGuides(watchOrderIndex.items).map((guide) => `/watch-order/${guide.slug}/`)
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
