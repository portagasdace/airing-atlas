import { displayTitle, recommendationsFor, watchOrderFor } from "@/lib/anime";
import { isQualityWatchOrderGuide, manualEditorialFor, manualFeaturedAnimeIds, manualSimilarGuideFor, manualWatchOrderFor, qualityWatchOrderGuides } from "@/lib/manual-content";
import type { AnimeSummary, CalendarEntry, WatchOrderGuide } from "@/types/anime";

export const NEXT_EPISODE_POPULARITY_FLOOR = 10000;
export const ANIME_DETAIL_POPULARITY_FLOOR = 100000;
export const ANIME_DETAIL_FAVOURITES_FLOOR = 8000;
export const ANIME_DETAIL_EXTREME_POPULARITY_FLOOR = 250000;
export const ANIME_DETAIL_EXTREME_FAVOURITES_FLOOR = 15000;
export const ANIME_LIKE_POPULARITY_FLOOR = 125000;
export const ANIME_LIKE_MIN_RECOMMENDATIONS = 5;
export const PUBLIC_ANIME_DETAIL_LIMIT = 10;
export const PUBLIC_ANIME_LIKE_LIMIT = 10;
export const PUBLIC_WATCH_ORDER_LIMIT = 10;
export const PUBLIC_WATCH_ORDER_EXCLUDED_ROOT_IDS = [100166, 161645];
export const ANIME_LIKE_SITEMAP_LIMIT = PUBLIC_ANIME_LIKE_LIMIT;
const blockedAnimeLikeFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);

export function isFutureTimestamp(timestamp?: number | null, nowUnix = currentUnix()): boolean {
  return Boolean(timestamp && timestamp > nowUnix);
}

export function futureAiringEntries(entries: CalendarEntry[], nowUnix = currentUnix()): CalendarEntry[] {
  return entries.filter((entry) => isFutureTimestamp(entry.airingAt, nowUnix));
}

export function hasFutureNextEpisode(anime: AnimeSummary, nowUnix = currentUnix()): boolean {
  return isFutureTimestamp(anime.nextAiringEpisode?.airingAt, nowUnix);
}

export function isQualityNextEpisodeAnime(anime: AnimeSummary, nowUnix = currentUnix()): boolean {
  return (
    hasFutureNextEpisode(anime, nowUnix) &&
    ((anime.popularity || 0) >= NEXT_EPISODE_POPULARITY_FLOOR || manualFeaturedAnimeIds.includes(anime.id))
  );
}

export function publicNextEpisodeAnime(items: AnimeSummary[], nowUnix = currentUnix()): AnimeSummary[] {
  const seen = new Set<number>();
  return items
    .filter((anime) => isQualityNextEpisodeAnime(anime, nowUnix))
    .sort((a, b) => (a.nextAiringEpisode?.airingAt || 0) - (b.nextAiringEpisode?.airingAt || 0))
    .filter((anime) => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });
}

export function hasQualityWatchOrderRoot(anime: AnimeSummary): boolean {
  const guide = watchOrderFor(anime.id);
  return Boolean(guide && guide.rootAnimeId === anime.id && isQualityWatchOrderGuide(guide));
}

export function hasStrongWatchOrderRoot(anime: AnimeSummary): boolean {
  return (
    hasQualityWatchOrderRoot(anime) &&
    (
      Boolean(manualWatchOrderFor(anime.id)) ||
      (anime.popularity || 0) >= ANIME_DETAIL_POPULARITY_FLOOR ||
      (anime.favourites || 0) >= ANIME_DETAIL_FAVOURITES_FLOOR
    )
  );
}

export function hasManualEditorialValue(anime: AnimeSummary): boolean {
  return Boolean(manualEditorialFor(anime.id));
}

export function hasExtremeDetailDemand(anime: AnimeSummary): boolean {
  return (
    (anime.popularity || 0) >= ANIME_DETAIL_EXTREME_POPULARITY_FLOOR ||
    (anime.favourites || 0) >= ANIME_DETAIL_EXTREME_FAVOURITES_FLOOR
  );
}

export function isPublicAnimeDetail(anime: AnimeSummary, _nowUnix = currentUnix()): boolean {
  return hasManualEditorialValue(anime);
}

export function publicAnimeDetailPages(items: AnimeSummary[], nowUnix = currentUnix(), limit = PUBLIC_ANIME_DETAIL_LIMIT): AnimeSummary[] {
  const seen = new Set<number>();
  return items
    .filter((anime) => isPublicAnimeDetail(anime, nowUnix))
    .sort((a, b) => qualityScore(b, nowUnix) - qualityScore(a, nowUnix) || (b.popularity || 0) - (a.popularity || 0))
    .filter((anime) => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    })
    .slice(0, limit);
}

export function isQualifiedAnimeLikeAnime(anime: AnimeSummary): boolean {
  const format = String(anime.format || "").toUpperCase();
  return (
    Boolean(manualSimilarGuideFor(anime.id)) &&
    (
      !blockedAnimeLikeFormats.has(format) &&
      recommendationsFor(anime.id).length >= ANIME_LIKE_MIN_RECOMMENDATIONS &&
      (anime.popularity || 0) >= ANIME_LIKE_POPULARITY_FLOOR
    )
  );
}

export function publicAnimeLikePages(items: AnimeSummary[], limit = PUBLIC_ANIME_LIKE_LIMIT): AnimeSummary[] {
  const seenIds = new Set<number>();
  const seenSlugs = new Set<string>();
  const curated = manualFeaturedAnimeIds
    .map((id) => items.find((anime) => anime.id === id))
    .filter((anime): anime is AnimeSummary => Boolean(anime && manualSimilarGuideFor(anime.id)));
  const automatic = items
    .filter((anime) => isQualifiedAnimeLikeAnime(anime) && !manualFeaturedAnimeIds.includes(anime.id))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return [...curated, ...automatic]
    .filter((anime) => {
      const slug = guideSlug(anime);
      if (seenIds.has(anime.id) || seenSlugs.has(slug)) return false;
      seenIds.add(anime.id);
      seenSlugs.add(slug);
      return true;
    })
    .slice(0, limit);
}

export function qualifiedAnimeLikePages(items: AnimeSummary[], limit = ANIME_LIKE_SITEMAP_LIMIT): AnimeSummary[] {
  return publicAnimeLikePages(items, limit);
}

export function publicWatchOrderGuides(guides: WatchOrderGuide[], limit = PUBLIC_WATCH_ORDER_LIMIT): WatchOrderGuide[] {
  const selected: WatchOrderGuide[] = [];
  const coveredAnimeIds = new Set<number>();

  const manualGuides = qualityWatchOrderGuides(guides)
    .filter((guide) => Boolean(manualWatchOrderFor(guide.rootAnimeId)));

  for (const guide of manualGuides) {
    if (PUBLIC_WATCH_ORDER_EXCLUDED_ROOT_IDS.includes(guide.rootAnimeId)) continue;
    const coverage = watchOrderGuideCoverageIds(guide);
    const overlapsExistingGuide = [...coverage].some((id) => coveredAnimeIds.has(id));
    if (overlapsExistingGuide && !manualFeaturedAnimeIds.includes(guide.rootAnimeId)) continue;

    selected.push(guide);
    for (const id of coverage) coveredAnimeIds.add(id);
    if (selected.length >= limit) break;
  }

  return selected;
}

function currentUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function guideSlug(anime: AnimeSummary): string {
  const title = displayTitle(anime);
  const shortTitle = title.split(":")[0]?.trim();
  const baseTitle = shortTitle && shortTitle.length >= 5 ? shortTitle : title;
  return baseTitle
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function watchOrderGuideCoverageIds(guide: WatchOrderGuide): Set<number> {
  return new Set([
    guide.rootAnimeId,
    ...(guide.entries || []).map((entry) => entry.animeId)
  ]);
}

function qualityScore(anime: AnimeSummary, nowUnix: number): number {
  let score = 0;
  if (manualFeaturedAnimeIds.includes(anime.id)) score += 100000000;
  if (hasQualityWatchOrderRoot(anime)) score += 10000000;
  if (isQualityNextEpisodeAnime(anime, nowUnix)) score += 1000000;
  score += (anime.popularity || 0) * 2;
  score += (anime.favourites || 0) * 25;
  score += recommendationsFor(anime.id).length * 1000;
  return score;
}
