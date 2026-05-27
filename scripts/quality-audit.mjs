import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manualFeaturedAnimeIds = new Set([16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061]);
const warnings = [];
const info = [];

const catalog = await readJson("src/data/generated/anime-catalog.json");
const calendar = await readJson("src/data/generated/airing-calendar.json");
const recommendations = await readJson("src/data/generated/recommendation-index.json");
const watchOrders = await readJson("src/data/generated/watch-order-index.json");
const nowUnix = Math.floor(Date.now() / 1000);
const animeById = new Map((catalog.anime || []).map((anime) => [anime.id, anime]));

auditDataFreshness();
auditRecommendationDepth();
auditWatchOrders();
await auditBuiltHtml();
await auditSitemap();

console.log("[quality] Airing Atlas quality audit");
for (const line of info) console.log(`[quality] ${line}`);
if (warnings.length) {
  console.warn(`[quality] ${warnings.length} warnings`);
  for (const warning of warnings) console.warn(`[quality] warning: ${warning}`);
} else {
  console.log("[quality] no warnings");
}

function auditDataFreshness() {
  const pastCalendar = (calendar.entries || []).filter((entry) => entry.airingAt && entry.airingAt <= nowUnix);
  if (pastCalendar.length) warnings.push(`${pastCalendar.length} calendar entries are already in the past.`);

  const publicNextEpisode = (catalog.anime || []).filter((anime) => isPublicNextEpisode(anime));
  const stalePublicNext = publicNextEpisode.filter((anime) => (anime.nextAiringEpisode?.airingAt || 0) <= nowUnix);
  if (stalePublicNext.length) warnings.push(`${stalePublicNext.length} public next-episode candidates are stale.`);
  info.push(`${publicNextEpisode.length} public next-episode candidates pass freshness and demand gates.`);
}

function auditRecommendationDepth() {
  const weak = (recommendations.items || [])
    .filter((item) => (animeById.get(item.animeId)?.popularity || 0) > 30000)
    .filter((item) => (item.recommendations || []).length < 5);
  if (weak.length) warnings.push(`${weak.length} popular anime have fewer than 5 recommendation candidates.`);
}

function auditWatchOrders() {
  const weak = (watchOrders.items || []).filter((guide) => (guide.entries || []).length < 3);
  if (weak.length) warnings.push(`${weak.length} watch-order guides have fewer than 3 entries.`);
  info.push(`${(watchOrders.items || []).length} watch-order guides generated before sitemap quality filtering.`);
}

async function auditBuiltHtml() {
  const dist = resolve(root, "dist");
  if (!existsSync(dist)) {
    warnings.push("dist/ does not exist; run pnpm run build before the quality audit for HTML checks.");
    return;
  }
  const files = await walk(dist, ".html");
  const titles = new Map();
  const descriptions = new Map();
  let missingImageDimensions = 0;
  let missingStructuredData = 0;

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const title = match(html, /<title>(.*?)<\/title>/is);
    const description = match(html, /<meta\s+name=["']description["']\s+content=["'](.*?)["']/is);
    if (title) addToMap(titles, title, file);
    if (description) addToMap(descriptions, description, file);
    missingImageDimensions += [...html.matchAll(/<img\s+[^>]*>/g)].filter((item) => !/\swidth=/.test(item[0]) || !/\sheight=/.test(item[0])).length;

    const isWatchOrder = file.includes("/watch-order/") && !file.endsWith("/watch-order/index.html");
    const isAnimeLike = file.includes("/anime-like/") && !file.endsWith("/anime-like/index.html");
    if ((isWatchOrder || isAnimeLike) && !html.includes("ItemList")) missingStructuredData += 1;
  }

  const duplicateTitles = duplicates(titles);
  const duplicateDescriptions = duplicates(descriptions);
  if (duplicateTitles.length) warnings.push(`${duplicateTitles.length} duplicate HTML title values found.`);
  if (duplicateDescriptions.length) warnings.push(`${duplicateDescriptions.length} duplicate meta descriptions found.`);
  if (missingImageDimensions) warnings.push(`${missingImageDimensions} built image tags are missing width or height.`);
  if (missingStructuredData) warnings.push(`${missingStructuredData} key guide pages are missing ItemList structured data.`);
  info.push(`${files.length} built HTML files scanned.`);
}

async function auditSitemap() {
  const sitemapPath = resolve(root, "dist/sitemap.xml");
  if (!existsSync(sitemapPath)) {
    warnings.push("dist/sitemap.xml does not exist; sitemap checks skipped.");
    return;
  }
  const sitemap = await readFile(sitemapPath, "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((item) => item[1]);
  const expiredNextEpisodeUrls = urls.filter((url) => {
    if (!url.includes("/next-episode/") || url.endsWith("/next-episode/")) return false;
    const slug = url.split("/next-episode/")[1]?.replace(/\/$/, "");
    const matches = (catalog.anime || []).filter((item) => slugFromAnime(item) === slug);
    return !matches.some((anime) => isPublicNextEpisode(anime));
  });
  const discoverClusterUrls = urls.filter((url) => url.includes("/discover/") && url !== "https://airingatlas.com/discover/");

  if (expiredNextEpisodeUrls.length) warnings.push(`${expiredNextEpisodeUrls.length} next-episode sitemap URLs fail freshness or demand gates.`);
  if (discoverClusterUrls.length < 8) warnings.push(`Only ${discoverClusterUrls.length} Discover cluster URLs found in sitemap; expected 8.`);
  info.push(`${urls.length} sitemap URLs scanned.`);
}

function isPublicNextEpisode(anime) {
  return Boolean(
    anime?.nextAiringEpisode?.airingAt &&
    anime.nextAiringEpisode.airingAt > nowUnix &&
    ((anime.popularity || 0) >= 10000 || manualFeaturedAnimeIds.has(anime.id))
  );
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(root, path), "utf8"));
}

async function walk(path, extension) {
  const result = [];
  for (const entry of await readdir(path)) {
    const full = resolve(path, entry);
    const details = await stat(full);
    if (details.isDirectory()) {
      result.push(...await walk(full, extension));
    } else if (full.endsWith(extension)) {
      result.push(full);
    }
  }
  return result;
}

function addToMap(map, key, value) {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function duplicates(map) {
  return [...map.values()].filter((items) => items.length > 1);
}

function match(value, pattern) {
  return value.match(pattern)?.[1]?.trim() || "";
}

function slugFromAnime(anime) {
  const title = anime.title?.english || anime.title?.romaji || anime.title?.native || String(anime.id);
  const shortTitle = title.split(":")[0]?.trim();
  const base = shortTitle && shortTitle.length >= 5 ? shortTitle : title;
  return base.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
}
