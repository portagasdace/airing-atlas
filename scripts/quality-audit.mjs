import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const manualFeaturedAnimeIds = new Set([16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061, 20954, 13601]);
const manualSimilarGuideIds = new Set([16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061, 20954, 13601]);
const manualWatchOrderRootIds = new Set([16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061]);
const adsenseReviewAnimeLikeIds = new Set([16498, 101922, 113415, 1535, 20954, 13601]);
const adsenseReviewWatchOrderIds = new Set([16498, 101922, 113415, 21, 20, 127230]);
const adsenseReviewDiscoverSlugs = new Set(["dark-fantasy-anime", "mind-game-anime", "romance-drama-anime", "anime-with-smart-main-character"]);
const ANIME_LIKE_POPULARITY_FLOOR = 125000;
const ANIME_LIKE_MIN_RECOMMENDATIONS = 5;
const REVIEW_ANIME_DETAIL_LIMIT = 0;
const PUBLIC_ANIME_LIKE_LIMIT = 12;
const PUBLIC_WATCH_ORDER_LIMIT = 10;
const REVIEW_ANIME_LIKE_LIMIT = 6;
const REVIEW_WATCH_ORDER_LIMIT = 6;
const REVIEW_DISCOVER_LIMIT = 4;
const REVIEW_SITEMAP_TARGET = 35;
const excludedPublicWatchOrderRootIds = new Set([100166, 161645]);
const SITEMAP_WARNING_CEILING = 40;
const blockedAnimeLikeFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);
const removedStaticPaths = new Set(["/calendar/", "/contact/", "/discover/", "/finished-anime/", "/next-episode/", "/privacy/", "/similar/", "/terms/", "/affiliate-disclosure/", "/watchlist/", "/rankings/"]);
const warnings = [];
const criticalWarnings = [];
const info = [];
const requireLiveData = process.env.REQUIRE_LIVE_DATA === "true";

const catalog = await readJson("src/data/generated/anime-catalog.json");
const calendar = await readJson("src/data/generated/airing-calendar.json");
const recommendations = await readJson("src/data/generated/recommendation-index.json");
const watchOrders = await readJson("src/data/generated/watch-order-index.json");
const firebaseConfig = await readJson("firebase.json");
const nowUnix = Math.floor(Date.now() / 1000);
const animeById = new Map((catalog.anime || []).map((anime) => [anime.id, anime]));
const animeBySlug = new Map((catalog.anime || []).map((anime) => [anime.slug, anime]));
const recommendationMap = new Map((recommendations.items || []).map((item) => [item.animeId, item.recommendations || []]));
const publicAnimeLikeGuideIds = new Set(reviewAnimeLikeGuides().map((anime) => anime.id));
const publicWatchOrderGuideSlugs = new Set(reviewWatchOrderGuides().map((guide) => guide.slug));

auditDataFreshness();
auditHostingConfig();
auditRecommendationDepth();
auditWatchOrders();
auditSlugCollisions();
await auditBuiltHtml();
await auditSitemap();

console.log("[quality] Airing Atlas quality audit");
for (const line of info) console.log(`[quality] ${line}`);
if (criticalWarnings.length) {
  console.error(`[quality] ${criticalWarnings.length} critical warnings`);
  for (const warning of criticalWarnings) console.error(`[quality] critical: ${warning}`);
}
if (warnings.length) {
  console.warn(`[quality] ${warnings.length} warnings`);
  for (const warning of warnings) console.warn(`[quality] warning: ${warning}`);
} else {
  console.log("[quality] no warnings");
}
if (criticalWarnings.length) process.exit(1);

function auditDataFreshness() {
  const pastCalendar = (calendar.entries || []).filter((entry) => entry.airingAt && entry.airingAt <= nowUnix);
  const futureCalendar = (calendar.entries || []).filter((entry) => entry.airingAt && entry.airingAt > nowUnix);
  const publicNextEpisode = (catalog.anime || []).filter((anime) => isPublicNextEpisode(anime));
  if (pastCalendar.length) info.push(`${pastCalendar.length} raw calendar entries are already in the past and should be filtered from public views.`);
  if (!futureCalendar.length && !publicNextEpisode.length) criticalWarnings.push("No future calendar or next-episode entries are available for public schedule views.");
  if (requireLiveData && calendar.source !== "anilist") criticalWarnings.push(`Expected live AniList data but calendar source was "${calendar.source}".`);

  const stalePublicNext = publicNextEpisode.filter((anime) => (anime.nextAiringEpisode?.airingAt || 0) <= nowUnix);
  if (stalePublicNext.length) criticalWarnings.push(`${stalePublicNext.length} public next-episode candidates are stale.`);
  info.push(`${publicNextEpisode.length} public next-episode candidates pass freshness and demand gates.`);
}

function auditHostingConfig() {
  const hosting = firebaseConfig.hosting || {};
  const catchAllHomeRewrite = (hosting.rewrites || []).some((rewrite) => rewrite.source === "**" && rewrite.destination === "/index.html");
  if (catchAllHomeRewrite) criticalWarnings.push("Firebase still rewrites every unknown URL to the homepage, creating soft 404 pages.");

  const requiredRedirects = new Map([
    ["/anime-like/jujutsu-kaisen-season-3/", "/anime-like/jujutsu-kaisen/"],
    ["/watch-order/100166-my-hero-academia-season-3/", "/watch-order/21459-my-hero-academia/"],
    ["/watch-order/161645-the-apothecary-diaries/", "/watch-order/"],
    ["/next-episode/mononoke/", "/next-episode/"]
  ]);
  const redirects = hosting.redirects || [];
  for (const [source, destination] of requiredRedirects) {
    const match = redirects.find((redirect) => redirect.source === source);
    if (!match || match.destination !== destination || Number(match.type) !== 301) {
      warnings.push(`Firebase redirect ${source} must permanently redirect to ${destination}.`);
    }
  }
  info.push(`${redirects.length} explicit Firebase legacy redirects audited; unknown routes are allowed to return 404.`);
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
  info.push(`${publicWatchOrderGuideSlugs.size} watch-order guides pass public index gates.`);
}

function auditSlugCollisions() {
  const animeLikeCollisions = slugCollisions(reviewAnimeLikeGuides(), slugFromAnime);
  const nextEpisodeCollisions = slugCollisions((catalog.anime || []).filter(isPublicNextEpisode), slugFromAnime);
  if (animeLikeCollisions.length) warnings.push(`${animeLikeCollisions.length} public anime-like slug collisions found: ${collisionPreview(animeLikeCollisions)}.`);
  if (nextEpisodeCollisions.length) warnings.push(`${nextEpisodeCollisions.length} public next-episode slug collisions found: ${collisionPreview(nextEpisodeCollisions)}.`);
}

async function auditBuiltHtml() {
  const dist = resolve(root, "dist");
  if (!existsSync(dist)) {
    criticalWarnings.push("dist/ does not exist; run pnpm run build before the quality audit for HTML checks.");
    return;
  }
  const files = await walk(dist, ".html");
  const titles = new Map();
  const descriptions = new Map();
  let missingImageDimensions = 0;
  let missingStructuredData = 0;
  let missingNoindex = 0;
  let missingEditorialValue = 0;
  let noindexWithAds = 0;
  let noindexDynamicPages = 0;
  const adRoutes = [];
  const retiredDataRoutes = [];
  let missingGuideDisclosure = 0;

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const route = `/${file.replace(`${dist}/`, "").replace(/index\.html$/, "")}`;
    const title = match(html, /<title>(.*?)<\/title>/is);
    const description = html.match(/<meta\s+name=["']description["']\s+content=(["'])(.*?)\1/is)?.[2]?.trim() || "";
    const hasNoindex = /<meta\s+name=["']robots["']\s+content=["']noindex,follow["']/i.test(html);
    const hasManualAd = html.includes('data-ad-slot="manual-content"');
    if (hasNoindex && hasManualAd) noindexWithAds += 1;
    if (hasManualAd) adRoutes.push(route);
    if (/^\/(?:anime|genres|seasons)\//.test(route) || /^\/next-episode\/[^/]+\//.test(route)) retiredDataRoutes.push(route);
    const isDynamicIndexSurface = /^\/(?:anime|anime-like|watch-order)\//.test(route);
    if (isDynamicIndexSurface && hasNoindex) noindexDynamicPages += 1;
    if (title) addToMap(titles, title, file);
    if (description) addToMap(descriptions, description, file);
    missingImageDimensions += [...html.matchAll(/<img\s+[^>]*>/g)].filter((item) => !/\swidth=/.test(item[0]) || !/\sheight=/.test(item[0])).length;

    const isWatchOrder = file.includes("/watch-order/") && !file.endsWith("/watch-order/index.html");
    const isAnimeLike = file.includes("/anime-like/") && !file.endsWith("/anime-like/index.html");
    const isEditorialGuide = /^\/guides\/[^/]+\//.test(route);
    if ((isWatchOrder || isAnimeLike) && !html.includes("ItemList")) missingStructuredData += 1;
    if (isEditorialGuide && (!html.includes("Written and reviewed by") || !html.includes("editorial-policy"))) missingGuideDisclosure += 1;

    const animeLikeSlug = route.match(/^\/anime-like\/([^/]+)\//)?.[1];
    const animeSlug = route.match(/^\/anime\/([^/]+)\//)?.[1];
    const watchOrderSlug = route.match(/^\/watch-order\/([^/]+)\//)?.[1];
    const discoverSlug = route.match(/^\/discover\/([^/]+)\//)?.[1];
    if (animeLikeSlug) {
      const anime = (catalog.anime || []).find((item) => slugFromAnime(item) === animeLikeSlug);
      if (anime && !publicAnimeLikeGuideIds.has(anime.id) && !hasNoindex) missingNoindex += 1;
    } else if (animeSlug) {
      const anime = animeBySlug.get(animeSlug);
      if (anime && !hasNoindex) missingNoindex += 1;
      if (anime && !hasNoindex && !html.includes("anime_editorial_value")) missingEditorialValue += 1;
    } else if (watchOrderSlug) {
      if (!publicWatchOrderGuideSlugs.has(watchOrderSlug) && !hasNoindex) missingNoindex += 1;
    }

    if (discoverSlug && !adsenseReviewDiscoverSlugs.has(discoverSlug) && !hasNoindex) missingNoindex += 1;

    if (/^\/next-episode\/[^/]+\//.test(route) && !hasNoindex) missingNoindex += 1;
    if (/^\/genres\/[^/]+\//.test(route) && !hasNoindex) missingNoindex += 1;
    if (/^\/seasons\/[^/]+\/[^/]+\//.test(route) && !hasNoindex) missingNoindex += 1;
    if (route === "/rankings/" && !hasNoindex) missingNoindex += 1;
    if (["/calendar/", "/discover/", "/finished-anime/", "/next-episode/", "/similar/"].includes(route) && !hasNoindex) missingNoindex += 1;
  }

  const duplicateTitles = duplicates(titles);
  const duplicateDescriptions = duplicates(descriptions);
  if (duplicateTitles.length) warnings.push(`${duplicateTitles.length} duplicate HTML title values found.`);
  if (duplicateDescriptions.length) warnings.push(`${duplicateDescriptions.length} duplicate meta descriptions found.`);
  if (missingImageDimensions) warnings.push(`${missingImageDimensions} built image tags are missing width or height.`);
  if (missingStructuredData) warnings.push(`${missingStructuredData} key guide pages are missing ItemList structured data.`);
  if (missingNoindex) warnings.push(`${missingNoindex} low-value generated pages are missing noindex,follow.`);
  if (noindexWithAds) warnings.push(`${noindexWithAds} noindex pages still render manual AdSense slots.`);
  if (missingEditorialValue) warnings.push(`${missingEditorialValue} public anime detail pages are missing Airing Atlas editorial value sections.`);
  if (missingGuideDisclosure) warnings.push(`${missingGuideDisclosure} editorial guides are missing author, source, or correction disclosures.`);
  const invalidAdRoutes = adRoutes.filter((route) => !/^\/guides\/[^/]+\//.test(route));
  if (invalidAdRoutes.length) warnings.push(`${invalidAdRoutes.length} non-editorial routes still render manual AdSense slots: ${invalidAdRoutes.slice(0, 5).join(", ")}.`);
  if (adRoutes.length !== 10) warnings.push(`${adRoutes.length} editorial pages render ads; expected exactly 10 during AdSense review.`);
  if (retiredDataRoutes.length) warnings.push(`${retiredDataRoutes.length} retired thin data routes were still built during AdSense review.`);
  if (files.length > 60) warnings.push(`${files.length} HTML files were built; review mode should stay at 60 or fewer.`);
  info.push(`${files.length} built HTML files scanned.`);
  info.push(`${noindexDynamicPages} generated dynamic pages carry noindex,follow.`);
  info.push(`${adRoutes.length} long-form editorial pages carry the only manual ad slots.`);
}

async function auditSitemap() {
  const sitemapPath = resolve(root, "dist/sitemap.xml");
  if (!existsSync(sitemapPath)) {
    criticalWarnings.push("dist/sitemap.xml does not exist; sitemap checks skipped.");
    return;
  }
  const sitemap = await readFile(sitemapPath, "utf8");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((item) => item[1]);
  const uniqueUrls = new Set(urls);
  const animeDetailUrls = urls.filter((url) => url.includes("/anime/") && !url.includes("/anime-like/"));
  const animeLikeUrls = urls.filter((url) => url.includes("/anime-like/") && !url.endsWith("/anime-like/"));
  const watchOrderUrls = urls.filter((url) => url.includes("/watch-order/") && !url.endsWith("/watch-order/"));
  const nextEpisodeUrls = urls.filter((url) => url.includes("/next-episode/") && !url.endsWith("/next-episode/"));
  const genreUrls = urls.filter((url) => url.includes("/genres/"));
  const seasonUrls = urls.filter((url) => url.includes("/seasons/"));
  const lowValueAnimeDetails = animeDetailUrls.filter((url) => {
    const slug = url.split("/anime/")[1]?.replace(/\/$/, "");
    const anime = animeBySlug.get(slug);
    return anime && !isPublicAnimeDetail(anime);
  });
  const weakAnimeLikeUrls = animeLikeUrls.filter((url) => {
    const slug = url.split("/anime-like/")[1]?.replace(/\/$/, "");
    const anime = (catalog.anime || []).find((item) => slugFromAnime(item) === slug);
    return anime && !publicAnimeLikeGuideIds.has(anime.id);
  });
  const weakWatchOrderUrls = watchOrderUrls.filter((url) => {
    const slug = url.split("/watch-order/")[1]?.replace(/\/$/, "");
    return slug && !publicWatchOrderGuideSlugs.has(slug);
  });
  const discoverClusterUrls = urls.filter((url) => url.includes("/discover/") && url !== "https://airingatlas.com/discover/");
  const guideArticleUrls = urls.filter((url) => /\/guides\/[^/]+\/$/.test(new URL(url).pathname));
  const removedStaticUrls = urls.filter((url) => removedStaticPaths.has(new URL(url).pathname));
  const sitemapNoindexUrls = [];
  for (const url of urls) {
    if (await urlHasNoindex(url)) sitemapNoindexUrls.push(url);
  }

  if (urls.length > SITEMAP_WARNING_CEILING) warnings.push(`${urls.length} sitemap URLs found; target is ${SITEMAP_WARNING_CEILING} or fewer during quality cleanup.`);
  if (urls.length !== REVIEW_SITEMAP_TARGET) warnings.push(`${urls.length} sitemap URLs found; expected the ${REVIEW_SITEMAP_TARGET}-URL review set.`);
  if (uniqueUrls.size !== urls.length) warnings.push(`${urls.length - uniqueUrls.size} duplicate sitemap URLs found.`);
  if (animeDetailUrls.length > REVIEW_ANIME_DETAIL_LIMIT) warnings.push(`${animeDetailUrls.length} anime detail URLs found in sitemap; target is ${REVIEW_ANIME_DETAIL_LIMIT} during AdSense review.`);
  if (lowValueAnimeDetails.length) warnings.push(`${lowValueAnimeDetails.length} anime detail URLs fail the public sitemap quality gate.`);
  if (animeLikeUrls.length > REVIEW_ANIME_LIKE_LIMIT) warnings.push(`${animeLikeUrls.length} anime-like URLs found in sitemap; target is ${REVIEW_ANIME_LIKE_LIMIT} or fewer during AdSense review.`);
  if (weakAnimeLikeUrls.length) warnings.push(`${weakAnimeLikeUrls.length} anime-like sitemap URLs fail recommendation or demand gates.`);
  if (watchOrderUrls.length > REVIEW_WATCH_ORDER_LIMIT) warnings.push(`${watchOrderUrls.length} watch-order URLs found in sitemap; target is ${REVIEW_WATCH_ORDER_LIMIT} or fewer during AdSense review.`);
  if (weakWatchOrderUrls.length) warnings.push(`${weakWatchOrderUrls.length} watch-order sitemap URLs fail public guide gates.`);
  if (nextEpisodeUrls.length) warnings.push(`${nextEpisodeUrls.length} next-episode detail URLs remain in the AdSense review sitemap.`);
  if (genreUrls.length) warnings.push(`${genreUrls.length} genre URLs remain in the AdSense review sitemap.`);
  if (seasonUrls.length) warnings.push(`${seasonUrls.length} season URLs remain in the AdSense review sitemap.`);
  if (removedStaticUrls.length) warnings.push(`${removedStaticUrls.length} low-intent static URLs remain in sitemap: ${removedStaticUrls.join(", ")}.`);
  if (sitemapNoindexUrls.length) warnings.push(`${sitemapNoindexUrls.length} sitemap URLs render noindex,follow.`);
  if (discoverClusterUrls.length !== REVIEW_DISCOVER_LIMIT) warnings.push(`${discoverClusterUrls.length} Discover cluster URLs found in sitemap; expected ${REVIEW_DISCOVER_LIMIT}.`);
  if (discoverClusterUrls.some((url) => !adsenseReviewDiscoverSlugs.has(new URL(url).pathname.split("/")[2]))) warnings.push("A non-review Discover cluster remains in the sitemap.");
  if (guideArticleUrls.length !== 10) warnings.push(`${guideArticleUrls.length} long-form guide URLs found in sitemap; expected 10.`);
  if (!urls.includes("https://airingatlas.com/editorial-policy/")) warnings.push("Editorial policy page is missing from sitemap.");
  info.push(`${animeDetailUrls.length} anime detail URLs pass sitemap quality gates.`);
  info.push(`${animeLikeUrls.length} anime-like URLs pass sitemap quality gates.`);
  info.push(`${watchOrderUrls.length} watch-order URLs pass sitemap quality gates.`);
  info.push(`${urls.length} sitemap URLs scanned.`);
}

function isPublicNextEpisode(anime) {
  return Boolean(
    anime?.nextAiringEpisode?.airingAt &&
    anime.nextAiringEpisode.airingAt > nowUnix &&
    ((anime.popularity || 0) >= 10000 || manualFeaturedAnimeIds.has(anime.id))
  );
}

function isPublicAnimeDetail() {
  return false;
}

function isQualifiedAnimeLike(anime) {
  const format = String(anime.format || "").toUpperCase();
  return Boolean(
    manualSimilarGuideIds.has(anime.id) &&
    (
      !blockedAnimeLikeFormats.has(format) &&
      (recommendationMap.get(anime.id) || []).length >= ANIME_LIKE_MIN_RECOMMENDATIONS &&
      (anime.popularity || 0) >= ANIME_LIKE_POPULARITY_FLOOR
    )
  );
}

function publicAnimeLikeGuides() {
  const seenIds = new Set();
  const seenSlugs = new Set();
  const curated = [...manualFeaturedAnimeIds]
    .map((id) => animeById.get(id))
    .filter((anime) => anime && manualSimilarGuideIds.has(anime.id));
  const automatic = (catalog.anime || [])
    .filter((anime) => isQualifiedAnimeLike(anime) && !manualFeaturedAnimeIds.has(anime.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return [...curated, ...automatic]
    .filter((anime) => {
      const slug = slugFromAnime(anime);
      if (seenIds.has(anime.id) || seenSlugs.has(slug)) return false;
      seenIds.add(anime.id);
      seenSlugs.add(slug);
      return true;
    })
    .slice(0, PUBLIC_ANIME_LIKE_LIMIT);
}

function reviewAnimeLikeGuides() {
  return publicAnimeLikeGuides().filter((anime) => adsenseReviewAnimeLikeIds.has(anime.id));
}

function publicWatchOrderGuides() {
  const seen = new Set();
  const coveredAnimeIds = new Set();
  const selected = [];
  const guides = watchOrders.items || [];
  const curated = [...manualFeaturedAnimeIds]
    .map((id) => guides.find((guide) => guide.rootAnimeId === id || (guide.entries || []).some((entry) => entry.animeId === id)))
    .filter((guide) => guide && manualWatchOrderRootIds.has(guide.rootAnimeId) && isQualityWatchOrderGuide(guide));
  const rest = guides.filter((guide) => manualWatchOrderRootIds.has(guide.rootAnimeId) && isQualityWatchOrderGuide(guide));

  for (const guide of [...curated, ...rest]) {
    if (excludedPublicWatchOrderRootIds.has(guide.rootAnimeId)) continue;
    if (seen.has(guide.slug)) continue;
    seen.add(guide.slug);

    const coverage = watchOrderGuideCoverageIds(guide);
    const overlapsExistingGuide = [...coverage].some((id) => coveredAnimeIds.has(id));
    if (overlapsExistingGuide && !manualFeaturedAnimeIds.has(guide.rootAnimeId)) continue;

    selected.push(guide);
    for (const id of coverage) coveredAnimeIds.add(id);
    if (selected.length >= PUBLIC_WATCH_ORDER_LIMIT) break;
  }

  return selected;
}

function reviewWatchOrderGuides() {
  return publicWatchOrderGuides().filter((guide) => adsenseReviewWatchOrderIds.has(guide.rootAnimeId));
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

function watchOrderGuideCoverageIds(guide) {
  return new Set([
    guide.rootAnimeId,
    ...(guide.entries || []).map((entry) => entry.animeId)
  ]);
}

function slugCollisions(items, slugFor) {
  const bySlug = new Map();
  for (const item of items) {
    const slug = slugFor(item);
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(item);
  }
  return [...bySlug.entries()].filter(([, values]) => values.length > 1);
}

function collisionPreview(collisions) {
  return collisions
    .slice(0, 3)
    .map(([slug, items]) => `${slug} (${items.map((item) => item.id || item.rootAnimeId).join(", ")})`)
    .join("; ");
}

async function urlHasNoindex(url) {
  const path = new URL(url).pathname;
  const htmlPath = resolve(root, "dist", path === "/" ? "index.html" : `${path.replace(/^\/|\/$/g, "")}/index.html`);
  if (!existsSync(htmlPath)) return false;
  const html = await readFile(htmlPath, "utf8");
  return /<meta\s+name=["']robots["']\s+content=["']noindex,follow["']/i.test(html);
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
