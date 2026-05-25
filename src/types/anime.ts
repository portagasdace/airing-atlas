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
  startDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  } | null;
  season?: string | null;
  seasonYear?: number | null;
  format?: string | null;
  status?: string | null;
  source?: string | null;
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
  tags?: Array<{
    name?: string | null;
    rank?: number | null;
    category?: string | null;
  }>;
  relations?: RelatedAnime[];
  recommendations?: AnimeRecommendation[];
  externalLinks?: Array<{
    site?: string | null;
    url?: string | null;
    type?: string | null;
    language?: string | null;
    isDisabled?: boolean | null;
  }>;
  streamingEpisodes?: Array<{
    title?: string | null;
    url?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  }>;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
    timeUntilAiring?: number;
  } | null;
  editorialNote?: string;
}

export interface RelatedAnime {
  animeId: number;
  title: string;
  slug: string;
  relationType?: string | null;
  format?: string | null;
  status?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  averageScore?: number | null;
  popularity?: number;
  startDate?: AnimeSummary["startDate"];
  coverImage?: string;
  siteUrl?: string;
}

export interface AnimeRecommendation {
  animeId: number;
  title: string;
  slug: string;
  rating?: number | null;
  score?: number | null;
  reason: string;
  signals: string[];
  source: "anilist" | "similarity";
  coverImage?: string;
  genres?: string[];
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

export interface GenreIndexItem {
  genre: string;
  slug: string;
  count: number;
  topIds: number[];
  airingIds: number[];
}

export interface SeasonIndexItem {
  slug: string;
  season: string;
  seasonYear: number;
  count: number;
  topIds: number[];
  airingIds: number[];
}

export interface WatchOrderGuide {
  slug: string;
  rootAnimeId: number;
  title: string;
  description: string;
  entries: RelatedAnime[];
}
