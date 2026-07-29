import { canonicalPath } from "@/lib/anime";
import { activeIndexableRoutes } from "@/lib/indexing";

export function GET() {
  const routes = activeIndexableRoutes();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${canonicalPath(route.path)}</loc>${route.lastModified ? `
    <lastmod>${route.lastModified}</lastmod>` : ""}
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
