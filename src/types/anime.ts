export type WatchStatus = "watching" | "planned" | "completed" | "dropped";

export interface AnimeTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

export interface AnimeSummary {
  id: number;
  slug: string;
  title: AnimeTitle;
  description?: string;
  season?: string | null;
  seasonYear?: number | null;
  format?: string | null;
  status?: string | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  meanScore?: number | null;
  popularity?: number;
  favourites?: number;
  genres?: string[];
  coverImage?: {
    large?: string | null;
    extraLarge?: string | null;
    color?: string | null;
  };
  bannerImage?: string | null;
  siteUrl?: string | null;
  studios?: Array<{ name?: string | null }>;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
    timeUntilAiring?: number;
  } | null;
  editorialNote?: string;
}

export interface CalendarEntry {
  animeId: number;
  title: string;
  episode?: number;
  airingAt: number;
  slug: string;
  coverImage?: string;
  genres?: string[];
}
