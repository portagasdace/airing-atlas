import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const paths = {
  queries: resolve(root, args.queries || "reports/search-console/queries.csv"),
  pages: resolve(root, args.pages || "reports/search-console/pages.csv"),
  indexing: resolve(root, args.indexing || "reports/search-console/indexing.csv"),
  out: resolve(root, args.out || "reports/seo-opportunities.md"),
  json: resolve(root, args.json || "reports/seo-opportunities.json")
};

const catalog = await readJson("src/data/generated/anime-catalog.json");
const watchOrders = await readJson("src/data/generated/watch-order-index.json");
const recommendations = await readJson("src/data/generated/recommendation-index.json");
const rows = {
  queries: await readCsvIfExists(paths.queries),
  pages: await readCsvIfExists(paths.pages),
  indexing: await readCsvIfExists(paths.indexing)
};

if (!rows.queries.length && !rows.pages.length && !rows.indexing.length) {
  console.log(`[seo] No Search Console CSV files found.
Place exports here, then rerun:
- ${relative(paths.queries)}
- ${relative(paths.pages)}
- ${relative(paths.indexing)}`);
  process.exit(0);
}

const sitemapUrls = await readSitemapUrls();
const opportunities = [
  ...queryOpportunities(rows.queries),
  ...pageOpportunities(rows.pages),
  ...indexingOpportunities(rows.indexing, sitemapUrls),
  ...catalogOpportunities()
]
  .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || (b.impressions || 0) - (a.impressions || 0));

await mkdir(dirname(paths.out), { recursive: true });
await writeFile(paths.json, `${JSON.stringify({ generatedAt: new Date().toISOString(), opportunities }, null, 2)}\n`);
await writeFile(paths.out, markdownReport(opportunities));
console.log(`[seo] Wrote ${opportunities.length} opportunities to ${relative(paths.out)} and ${relative(paths.json)}`);

function queryOpportunities(items) {
  return items.flatMap((row) => {
    const query = valueFor(row, ["query", "top queries", "查询", "热门查询"]);
    const impressions = numberFor(row, ["impressions", "展示次数", "展示"]);
    const clicks = numberFor(row, ["clicks", "点击次数", "点击"]);
    const ctr = ratioFor(row, ["ctr", "点击率"]);
    if (!query || impressions < 20) return [];

    const intent = intentFor(query);
    const target = targetForQuery(query, intent);
    const result = [];
    if (impressions >= 50 && ctr < 0.01) {
      result.push({
        priority: "high",
        type: "low_ctr_query",
        target,
        query,
        impressions,
        clicks,
        ctr,
        recommendation: `Rewrite the title and meta description around "${query}" and make the matching phrase visible in the first screen.`
      });
    }
    if (intent !== "general") {
      result.push({
        priority: impressions >= 80 ? "high" : "medium",
        type: "new_search_intent",
        target,
        query,
        impressions,
        clicks,
        ctr,
        recommendation: `Map this ${intent} query to a stronger internal guide, then link it from related anime/detail pages.`
      });
    }
    return result;
  });
}

function pageOpportunities(items) {
  return items.flatMap((row) => {
    const page = valueFor(row, ["page", "top pages", "网页", "页面"]);
    const impressions = numberFor(row, ["impressions", "展示次数", "展示"]);
    const clicks = numberFor(row, ["clicks", "点击次数", "点击"]);
    const ctr = ratioFor(row, ["ctr", "点击率"]);
    if (!page || impressions < 30) return [];

    const result = [];
    if (ctr < 0.01) {
      result.push({
        priority: "high",
        type: "low_ctr_page",
        target: page,
        impressions,
        clicks,
        ctr,
        recommendation: "Improve the title link promise: make the page title more specific, add the exact search wording near the H1, and tighten the meta description."
      });
    }
    if (clicks >= 5 && impressions >= 40) {
      result.push({
        priority: "medium",
        type: "clicked_page_expansion",
        target: page,
        impressions,
        clicks,
        ctr,
        recommendation: "Protect this page and add two contextual internal links so successful traffic can move deeper into the site."
      });
    }
    return result;
  });
}

function indexingOpportunities(items, sitemapUrls) {
  return items.flatMap((row) => {
    const url = valueFor(row, ["url", "page", "网页", "页面"]);
    const reason = valueFor(row, ["reason", "status", "状态", "原因"]);
    if (!url || !reason) return [];
    const normalized = reason.toLowerCase();
    const notIndexed = normalized.includes("not indexed") || normalized.includes("尚未编入索引") || normalized.includes("未编入索引");
    if (!notIndexed) return [];
    const inSitemap = sitemapUrls.has(url) || sitemapUrls.has(`${url.replace(/\/$/, "")}/`);
    return [{
      priority: inSitemap ? "high" : "medium",
      type: "indexing_gap",
      target: url,
      recommendation: inSitemap
        ? `This URL is in the sitemap but reported as "${reason}". Add unique content or remove it from the sitemap quality gate.`
        : `This URL is not in the current sitemap. Keep it out unless it gains enough content and internal links.`,
      reason,
      inSitemap
    }];
  });
}

function catalogOpportunities() {
  const recommendationMap = new Map((recommendations.items || []).map((item) => [item.animeId, item.recommendations || []]));
  const thinAnimeLike = (catalog.anime || [])
    .filter((anime) => (anime.popularity || 0) > 30000)
    .filter((anime) => (recommendationMap.get(anime.id) || []).length < 5)
    .slice(0, 10)
    .map((anime) => ({
      priority: "medium",
      type: "thin_anime_like_candidate",
      target: `/anime-like/${slugFromAnime(anime)}/`,
      recommendation: `Popular title with fewer than 5 recommendation candidates. Add manual recommendation notes before promoting this page.`
    }));

  const weakWatchOrders = (watchOrders.items || [])
    .filter((guide) => (guide.entries || []).length < 3)
    .map((guide) => ({
      priority: "high",
      type: "weak_watch_order",
      target: `/watch-order/${guide.slug}/`,
      recommendation: "Keep this guide out of sitemap until it has at least 3 valid anime entries."
    }));

  return [...thinAnimeLike, ...weakWatchOrders];
}

function markdownReport(items) {
  const lines = [
    "# SEO Opportunity Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    items.length ? "## Opportunities" : "No opportunities found from the supplied CSV files.",
    ""
  ];

  for (const item of items.slice(0, 80)) {
    lines.push(`- **${item.priority.toUpperCase()}** ${item.type}: ${item.target || item.query || "unknown target"}`);
    lines.push(`  ${item.recommendation}`);
    if (item.query) lines.push(`  Query: ${item.query}`);
    if (item.impressions !== undefined) lines.push(`  Impressions: ${item.impressions}; Clicks: ${item.clicks || 0}; CTR: ${percent(item.ctr || 0)}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function readCsvIfExists(path) {
  if (!existsSync(path)) return [];
  const text = await readFile(path, "utf8");
  return parseCsv(text);
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

async function readSitemapUrls() {
  const path = resolve(root, "dist/sitemap.xml");
  if (!existsSync(path)) return new Set();
  const text = await readFile(path, "utf8");
  return new Set([...text.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers = [], ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim().toLowerCase(), (cells[index] || "").trim()])));
}

function valueFor(row, keys) {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    const match = Object.keys(normalized).find((candidate) => candidate === key.toLowerCase() || candidate.includes(key.toLowerCase()));
    if (match && normalized[match]) return normalized[match];
  }
  return "";
}

function numberFor(row, keys) {
  const value = valueFor(row, keys);
  return Number(String(value).replace(/[,%\s]/g, "")) || 0;
}

function ratioFor(row, keys) {
  const value = valueFor(row, keys);
  if (!value) return 0;
  const number = Number(String(value).replace("%", "").trim());
  return value.includes("%") ? number / 100 : number;
}

function intentFor(query) {
  const value = query.toLowerCase();
  if (value.includes("watch order") || value.includes("how to watch")) return "watch order";
  if (value.includes("next episode") || value.includes("release schedule")) return "next episode";
  if (value.includes("anime like") || value.includes("similar to") || value.includes("shows like")) return "anime like";
  if (value.includes("best") || value.includes("dark fantasy") || value.includes("shounen")) return "discover";
  return "general";
}

function targetForQuery(query, intent) {
  const normalized = query.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
  if (intent === "watch order") return `/watch-order/`;
  if (intent === "next episode") return `/next-episode/`;
  if (intent === "anime like") return `/anime-like/${normalized.replace(/^anime-like-/, "")}/`;
  if (intent === "discover") return `/discover/${normalized}/`;
  return "/discover/";
}

function slugFromAnime(anime) {
  const title = anime.title?.english || anime.title?.romaji || anime.title?.native || String(anime.id);
  return title.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
}

function priorityWeight(priority) {
  return { low: 1, medium: 2, high: 3 }[priority] || 0;
}

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function parseArgs(values) {
  const result = {};
  for (let index = 0; index < values.length; index += 1) {
    const item = values[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = values[index + 1];
    if (next && !next.startsWith("--")) {
      result[key] = next;
      index += 1;
    } else {
      result[key] = true;
    }
  }
  return result;
}

function relative(path) {
  return path.replace(`${root}/`, "");
}
