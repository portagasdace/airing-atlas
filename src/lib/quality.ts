import { manualFeaturedAnimeIds } from "@/lib/manual-content";
import type { AnimeSummary, CalendarEntry } from "@/types/anime";

export const NEXT_EPISODE_POPULARITY_FLOOR = 10000;

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

function currentUnix(): number {
  return Math.floor(Date.now() / 1000);
}
