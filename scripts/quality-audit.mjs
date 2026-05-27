import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manualFeaturedAnimeIds = new Set([16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061]);
const ANIME_DETAIL_POPULARITY_FLOOR = 100000;
const ANIME_DETAIL_FAVOURITES_FLOOR = 8000;
const ANIME_LIKE_POPULARITY_FLOOR = 125000;
const ANIME_LIKE_MIN_RECOMMENDATIONS = 5;
const SITEMAP_WARNING_CEILING = 520;
const blockedAnimeLikeFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);
const warnings = [];
const info = [];

const catalog = await readJson("src/data/generated/anime-catalog.json");
const calendar = await readJson("src/data/generated/airing-calendar.json");
const recommendations = await readJson("src/data/generated/recommendation-index.json");
const watchOrders = await readJson("src/data/generated/watch-order-index.json");
const nowUnix = Math.floor(Date.now() / 1000);
const animeById = new Map((catalog.anime || []).map((anime) => [anime.id, anime]));
const animeBySlug = new Map((catalog.anime || []).map((anime) => [anime.slug, anime]));
const recommendationMap = new Map((recommendations.items || []).map((item) => [item.animeId, item.recommendations || []]));
const qualityWatchOrderRoots = new Set((watchOrders.items || []).filter(isQualityWatchOrderGuide).map((guide) => guide.rootAnimeId));

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
  const futureCalendar = (calendar.entries || []).filter((entry) => entry.airingAt && entry.airingAt > nowUnix);
  if (pastCalendar.length) info.push(`${pastCalendar.length} raw calendar entries are already in the past and should be filtered from public views.`);
  if (!futureCalendar.length) warnings.push("No future calendar entries are available for public schedule views.");

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
    const description = html.match(/<meta\s+name=["']description["']\s+content=(["'])(.*?)\1/is)?.[2]?.trim() || "";
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
  const animeDetailUrls = urls.filter((url) => url.includes("/anime/") && !url.includes("/anime-like/"));
  const animeLikeUrls = urls.filter((url) => url.includes("/anime-like/") && !url.endsWith("/anime-like/"));
  const lowValueAnimeDetails = animeDetailUrls.filter((url) => {
    const slug = url.split("/anime/")[1]?.replace(/\/$/, "");
    const anime = animeBySlug.get(slug);
    return anime && !isPublicAnimeDetail(anime);
  });
  const weakAnimeLikeUrls = animeLikeUrls.filter((url) => {
    const slug = url.split("/anime-like/")[1]?.replace(/\/$/, "");
    const anime = (catalog.anime || []).find((item) => slugFromAnime(item) === slug);
    return anime && !isQualifiedAnimeLike(anime);
  });
  const expiredNextEpisodeUrls = urls.filter((url) => {
    if (!url.includes("/next-episode/") || url.endsWith("/next-episode/")) return false;
    const slug = url.split("/next-episode/")[1]?.replace(/\/$/, "");
    const matches = (catalog.anime || []).filter((item) => slugFromAnime(item) === slug);
    return !matches.some((anime) => isPublicNextEpisode(anime));
  });
  const discoverClusterUrls = urls.filter((url) => url.includes("/discover/") && url !== "https://airingatlas.com/discover/");

  if (urls.length > SITEMAP_WARNING_CEILING) warnings.push(`${urls.length} sitemap URLs found; target is ${SITEMAP_WARNING_CEILING} or fewer during quality cleanup.`);
  if (lowValueAnimeDetails.length) warnings.push(`${lowValueAnimeDetails.length} anime detail URLs fail the public sitemap quality gate.`);
  if (animeLikeUrls.length > 90) warnings.push(`${animeLikeUrls.length} anime-like URLs found in sitemap; target is 90 or fewer.`);
  if (weakAnimeLikeUrls.length) warnings.push(`${weakAnimeLikeUrls.length} anime-like sitemap URLs fail recommendation or demand gates.`);
  if (expiredNextEpisodeUrls.length) warnings.push(`${expiredNextEpisodeUrls.length} next-episode sitemap URLs fail freshness or demand gates.`);
  if (discoverClusterUrls.length < 8) warnings.push(`Only ${discoverClusterUrls.length} Discover cluster URLs found in sitemap; expected 8.`);
  info.push(`${animeDetailUrls.length} anime detail URLs pass sitemap quality gates.`);
  info.push(`${animeLikeUrls.length} anime-like URLs pass sitemap quality gates.`);
  info.push(`${urls.length} sitemap URLs scanned.`);
}

function isPublicNextEpisode(anime) {
  return Boolean(
    anime?.nextAiringEpisode?.airingAt &&
    anime.nextAiringEpisode.airingAt > nowUnix &&
    ((anime.popularity || 0) >= 10000 || manualFeaturedAnimeIds.has(anime.id))
  );
}

function isPublicAnimeDetail(anime) {
  return Boolean(
    manualFeaturedAnimeIds.has(anime.id) ||
    isPublicNextEpisode(anime) ||
    qualityWatchOrderRoots.has(anime.id) ||
    (anime.popularity || 0) >= ANIME_DETAIL_POPULARITY_FLOOR ||
    (anime.favourites || 0) >= ANIME_DETAIL_FAVOURITES_FLOOR
  );
}

function isQualifiedAnimeLike(anime) {
  const format = String(anime.format || "").toUpperCase();
  return Boolean(
    manualFeaturedAnimeIds.has(anime.id) ||
    (
      !blockedAnimeLikeFormats.has(format) &&
      (recommendationMap.get(anime.id) || []).length >= ANIME_LIKE_MIN_RECOMMENDATIONS &&
      (anime.popularity || 0) >= ANIME_LIKE_POPULARITY_FLOOR
    )
  );
}

function isQualityWatchOrderGuide(guide) {
  const entries = (guide.entries || []).filter((entry) => {
    const format = String(entry.format || "").toUpperCase();
    const relation = String(entry.relationType || "").toUpperCase();
    return !["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"].includes(format) && !["SOURCE", "CHARACTER", "OTHER"].includes(relation);
  });
  const hasMainStory = entries.some((entry) => !["SUMMARY", "ALTERNATIVE"].includes(String(entry.relationType || "").toUpperCase()));
  return entries.length >= 3 && hasMainStory;
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
