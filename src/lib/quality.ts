import { recommendationsFor, watchOrderFor } from "@/lib/anime";
import { isQualityWatchOrderGuide, manualFeaturedAnimeIds } from "@/lib/manual-content";
import type { AnimeSummary, CalendarEntry } from "@/types/anime";

export const NEXT_EPISODE_POPULARITY_FLOOR = 10000;
export const ANIME_DETAIL_POPULARITY_FLOOR = 100000;
export const ANIME_DETAIL_FAVOURITES_FLOOR = 8000;
export const ANIME_LIKE_POPULARITY_FLOOR = 125000;
export const ANIME_LIKE_MIN_RECOMMENDATIONS = 5;
export const ANIME_LIKE_SITEMAP_LIMIT = 80;
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

export function isPublicAnimeDetail(anime: AnimeSummary, nowUnix = currentUnix()): boolean {
  return (
    manualFeaturedAnimeIds.includes(anime.id) ||
    isQualityNextEpisodeAnime(anime, nowUnix) ||
    hasQualityWatchOrderRoot(anime) ||
    (anime.popularity || 0) >= ANIME_DETAIL_POPULARITY_FLOOR ||
    (anime.favourites || 0) >= ANIME_DETAIL_FAVOURITES_FLOOR
  );
}

export function publicAnimeDetailPages(items: AnimeSummary[], nowUnix = currentUnix()): AnimeSummary[] {
  const seen = new Set<number>();
  return items
    .filter((anime) => isPublicAnimeDetail(anime, nowUnix))
    .sort((a, b) => qualityScore(b, nowUnix) - qualityScore(a, nowUnix) || (b.popularity || 0) - (a.popularity || 0))
    .filter((anime) => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    });
}

export function isQualifiedAnimeLikeAnime(anime: AnimeSummary): boolean {
  const format = String(anime.format || "").toUpperCase();
  return (
    manualFeaturedAnimeIds.includes(anime.id) ||
    (
      !blockedAnimeLikeFormats.has(format) &&
      recommendationsFor(anime.id).length >= ANIME_LIKE_MIN_RECOMMENDATIONS &&
      (anime.popularity || 0) >= ANIME_LIKE_POPULARITY_FLOOR
    )
  );
}

export function qualifiedAnimeLikePages(items: AnimeSummary[], limit = ANIME_LIKE_SITEMAP_LIMIT): AnimeSummary[] {
  const seen = new Set<number>();
  const curated = manualFeaturedAnimeIds
    .map((id) => items.find((anime) => anime.id === id))
    .filter((anime): anime is AnimeSummary => Boolean(anime));
  const automatic = items
    .filter(isQualifiedAnimeLikeAnime)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return [...curated, ...automatic]
    .filter((anime) => {
      if (seen.has(anime.id)) return false;
      seen.add(anime.id);
      return true;
    })
    .slice(0, limit);
}

function currentUnix(): number {
  return Math.floor(Date.now() / 1000);
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
