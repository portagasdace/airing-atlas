import catalog from "@/data/generated/anime-catalog.json";
import calendar from "@/data/generated/airing-calendar.json";
import recommendations from "@/data/generated/recommendation-index.json";
import watchOrders from "@/data/generated/watch-order-index.json";
import genres from "@/data/generated/genre-index.json";
import seasons from "@/data/generated/season-index.json";
import type { AnimeRecommendation, AnimeSummary, CalendarEntry, GenreIndexItem, SeasonIndexItem, WatchOrderGuide } from "@/types/anime";

type RankingKey = keyof typeof catalog.rankings;
type Catalog = Omit<typeof catalog, "anime"> & { anime: AnimeSummary[] };
type Calendar = Omit<typeof calendar, "entries"> & { entries: CalendarEntry[] };
type RecommendationIndex = Omit<typeof recommendations, "items"> & { items: Array<{ animeId: number; recommendations: AnimeRecommendation[] }> };
type WatchOrderIndex = Omit<typeof watchOrders, "items"> & { items: WatchOrderGuide[] };
type GenreIndex = Omit<typeof genres, "items"> & { items: GenreIndexItem[] };
type SeasonIndex = Omit<typeof seasons, "items"> & { items: SeasonIndexItem[] };

export const animeCatalog = catalog as unknown as Catalog;
export const airingCalendar = calendar as unknown as Calendar;
export const recommendationIndex = recommendations as unknown as RecommendationIndex;
export const watchOrderIndex = watchOrders as unknown as WatchOrderIndex;
export const genreIndex = genres as unknown as GenreIndex;
export const seasonIndex = seasons as unknown as SeasonIndex;
export const allAnime = animeCatalog.anime;
export const allAiringEntries = airingCalendar.entries;

export function displayTitle(anime: Pick<AnimeSummary, "title">): string {
  return anime.title.english || anime.title.romaji || anime.title.native || "Untitled Anime";
}

export function animeById(id: number): AnimeSummary | undefined {
  return allAnime.find((anime) => anime.id === id);
}

export function animeByRanking(key: RankingKey): AnimeSummary[] {
  return (animeCatalog.rankings[key] || [])
    .map((id) => animeById(id))
    .filter(Boolean) as AnimeSummary[];
}

export function animeByIds(ids: number[] = []): AnimeSummary[] {
  return ids.map((id) => animeById(id)).filter(Boolean) as AnimeSummary[];
}

export function recommendationsFor(animeId: number): AnimeRecommendation[] {
  return recommendationIndex.items.find((item) => item.animeId === animeId)?.recommendations || [];
}

export function watchOrderFor(animeId: number): WatchOrderGuide | undefined {
  return watchOrderIndex.items.find((item) => item.rootAnimeId === animeId || item.entries.some((entry) => entry.animeId === animeId));
}

export function cleanText(value = "", maxLength = 180): string {
  const cleaned = value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}...`;
}

export function scoreLabel(anime: AnimeSummary): string {
  const score = anime.averageScore || anime.meanScore;
  return score ? `${score}%` : "TBD";
}

export function seasonLabel(anime: AnimeSummary): string {
  if (!anime.season || !anime.seasonYear) return "Season TBA";
  return `${titleCase(anime.season)} ${anime.seasonYear}`;
}

export function titleCase(value: string): string {
  return value.replace(/[-_]/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatNumber(value?: number): string {
  if (!value) return "0";
  return new Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard" }).format(value);
}

export function episodeLabel(anime: AnimeSummary): string {
  if (anime.episodes) return `${anime.episodes} episodes`;
  if (anime.status === "RELEASING") return "Ongoing";
  return "Episodes TBA";
}

export function dateTimeLabel(timestamp?: number): string {
  if (!timestamp) return "No upcoming episode";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(new Date(timestamp * 1000));
}

export function fuzzyDateLabel(date?: AnimeSummary["startDate"]): string {
  if (!date?.year) return "Date TBA";
  const month = date.month ? String(date.month).padStart(2, "0") : "01";
  const day = date.day ? String(date.day).padStart(2, "0") : "01";
  return new Intl.DateTimeFormat("en-US", {
    month: date.month ? "short" : undefined,
    day: date.day ? "numeric" : undefined,
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date.year}-${month}-${day}T00:00:00Z`));
}

export function canonicalPath(path = ""): string {
  const base = import.meta.env.PUBLIC_SITE_URL || "https://airingatlas.com";
  return new URL(path, base).toString();
}

export function animeSeoTitle(anime: AnimeSummary, items: AnimeSummary[] = allAnime): string {
  const title = displayTitle(anime);
  const duplicateCount = items.filter((item) => displayTitle(item).toLowerCase() === title.toLowerCase()).length;
  if (duplicateCount <= 1) return title;

  const year = anime.seasonYear || anime.startDate?.year;
  const parts = [
    anime.format ? titleCase(anime.format) : "Anime",
    year ? String(year) : "",
    anime.episodes ? `${anime.episodes} eps` : ""
  ].filter(Boolean);
  const candidate = parts.length ? `${title} (${parts.join(", ")})` : `${title} Anime Guide`;
  const candidateCount = items.filter((item) => {
    const itemYear = item.seasonYear || item.startDate?.year;
    const itemParts = [
      item.format ? titleCase(item.format) : "Anime",
      itemYear ? String(itemYear) : "",
      item.episodes ? `${item.episodes} eps` : ""
    ].filter(Boolean);
    return `${displayTitle(item)} (${itemParts.join(", ")})` === candidate;
  }).length;

  return candidateCount <= 1 ? candidate : `${candidate} AniList ${anime.id}`;
}

export function animeSeoDescription(anime: AnimeSummary, editorialIntro?: string): string {
  const title = animeSeoTitle(anime);
  const facts = [
    anime.format ? titleCase(anime.format) : "anime",
    anime.seasonYear || anime.startDate?.year ? seasonLabel(anime) : "",
    anime.status ? titleCase(anime.status) : "",
    anime.source ? `${titleCase(anime.source)} source` : ""
  ].filter(Boolean);
  const intro = editorialIntro || cleanText(anime.description, 112);
  const factText = facts.length ? ` ${facts.join(", ")}.` : "";
  const utility = ` Track ${title} with score, genres, recommendations, watch order links, next episode data, and legal research links.`;
  return cleanText(`${intro}${factText}${utility}`, 175);
}
