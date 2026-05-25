import catalog from "@/data/generated/anime-catalog.json";
import calendar from "@/data/generated/airing-calendar.json";
import type { AnimeSummary, CalendarEntry } from "@/types/anime";

type Catalog = typeof catalog & { anime: AnimeSummary[] };
type Calendar = typeof calendar & { entries: CalendarEntry[] };

export const animeCatalog = catalog as Catalog;
export const airingCalendar = calendar as Calendar;
export const allAnime = animeCatalog.anime;
export const allAiringEntries = airingCalendar.entries;

export function displayTitle(anime: Pick<AnimeSummary, "title">): string {
  return anime.title.english || anime.title.romaji || anime.title.native || "Untitled Anime";
}

export function animeById(id: number): AnimeSummary | undefined {
  return allAnime.find((anime) => anime.id === id);
}

export function animeByRanking(key: keyof typeof animeCatalog.rankings): AnimeSummary[] {
  return (animeCatalog.rankings[key] || [])
    .map((id) => animeById(id))
    .filter(Boolean) as AnimeSummary[];
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
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
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

export function canonicalPath(path = ""): string {
  const base = import.meta.env.PUBLIC_SITE_URL || "https://airingatlas.com";
  return new URL(path, base).toString();
}
