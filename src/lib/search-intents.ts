import { allAnime, displayTitle, titleCase } from "@/lib/anime";
import { isQualityNextEpisodeAnime, qualifiedAnimeLikePages } from "@/lib/quality";
import type { AnimeRecommendation, AnimeSummary, WatchOrderGuide } from "@/types/anime";

export interface SearchIntentLink {
  label: string;
  href: string;
  intent: string;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function animeLikeSlug(anime: AnimeSummary): string {
  const title = displayTitle(anime);
  const shortTitle = title.split(":")[0]?.trim();
  const baseTitle = shortTitle && shortTitle.length >= 5 ? shortTitle : title;
  return slugify(baseTitle);
}

export function animeLikeSlugCandidates(anime: AnimeSummary): string[] {
  const title = displayTitle(anime);
  return unique([
    animeLikeSlug(anime),
    slugify(title),
    anime.slug.replace(/^\d+-/, "")
  ]).filter(Boolean);
}

export function nextEpisodeSlug(anime: AnimeSummary): string {
  return animeLikeSlug(anime);
}

export function hasPublicAnimeLikeGuide(anime: AnimeSummary): boolean {
  return publicAnimeLikeGuideIds().has(anime.id);
}

export function animeLikeGuideHref(anime: AnimeSummary): string {
  return hasPublicAnimeLikeGuide(anime)
    ? `/anime-like/${animeLikeSlug(anime)}/`
    : `/similar/?anime=${anime.id}`;
}

export function relatedSearchIntents(options: {
  anime: AnimeSummary;
  recommendations?: AnimeRecommendation[];
  guide?: WatchOrderGuide;
  genreLinks?: Array<{ name: string; slug?: string }>;
}): SearchIntentLink[] {
  const { anime, recommendations = [], guide, genreLinks = [] } = options;
  const title = displayTitle(anime);
  const firstGenre = anime.genres?.[0];
  const secondGenre = anime.genres?.[1];
  const studio = anime.studios?.[0]?.name;
  const topRecommendation = recommendations[0]?.title;
  const hasPublicNextEpisode = isQualityNextEpisodeAnime(anime);
  const animeLikeHref = animeLikeGuideHref(anime);
  const hasAnimeLikeGuide = hasPublicAnimeLikeGuide(anime);

  return uniqueByLabel([
    {
      label: `anime like ${title}`,
      href: animeLikeHref,
      intent: hasAnimeLikeGuide ? "Similar guide" : "Similarity tool"
    },
    {
      label: `shows similar to ${title}`,
      href: `/similar/?anime=${anime.id}`,
      intent: "Recommendations"
    },
    {
      label: `${title} recommendations`,
      href: `/similar/?anime=${anime.id}`,
      intent: "Recommendations"
    },
    hasPublicNextEpisode && {
      label: `${title} next episode`,
      href: `/next-episode/${nextEpisodeSlug(anime)}/`,
      intent: "Release schedule"
    },
    hasPublicNextEpisode && {
      label: `${title} release schedule`,
      href: `/next-episode/${nextEpisodeSlug(anime)}/`,
      intent: "Release schedule"
    },
    guide && {
      label: `${title} watch order`,
      href: `/watch-order/${guide.slug}/`,
      intent: "Watch order"
    },
    firstGenre && secondGenre && {
      label: `${firstGenre.toLowerCase()} ${secondGenre.toLowerCase()} anime`,
      href: `/discover/?q=${encodeURIComponent(`${firstGenre} ${secondGenre}`)}`,
      intent: "Genre search"
    },
    firstGenre && {
      label: `best ${firstGenre.toLowerCase()} anime`,
      href: genreLinks.find((genre) => genre.name === firstGenre)?.slug
        ? `/genres/${genreLinks.find((genre) => genre.name === firstGenre)?.slug}/`
        : `/discover/?q=${encodeURIComponent(firstGenre)}`,
      intent: "Genre search"
    },
    studio && {
      label: `${studio} anime`,
      href: `/discover/?q=${encodeURIComponent(studio)}`,
      intent: "Studio search"
    },
    anime.source && sourceIntentLabel(anime.source, title),
    topRecommendation && {
      label: `${title} vs ${topRecommendation}`,
      href: animeLikeHref,
      intent: "Comparison"
    }
  ]).slice(0, 10);
}

let cachedPublicAnimeLikeGuideIds: Set<number> | undefined;

function publicAnimeLikeGuideIds(): Set<number> {
  cachedPublicAnimeLikeGuideIds ??= new Set(qualifiedAnimeLikePages(allAnime).map((anime) => anime.id));
  return cachedPublicAnimeLikeGuideIds;
}

function sourceIntentLabel(source: string, title: string): SearchIntentLink {
  const sourceLabel = titleCase(source);
  if (source.toUpperCase() === "MANGA") {
    return {
      label: `${title} manga adaptation`,
      href: `/discover/?q=${encodeURIComponent(`${title} adaptation`)}`,
      intent: "Source"
    };
  }
  return {
    label: `${sourceLabel} anime like ${title}`,
    href: `/discover/?q=${encodeURIComponent(`${source} ${title}`)}`,
    intent: "Source"
  };
}

export function weeklyAiringLabel(timestamp?: number): string {
  if (!timestamp) return "Schedule TBA";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(new Date(timestamp * 1000));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function uniqueByLabel(items: Array<SearchIntentLink | false | "" | undefined | null>): SearchIntentLink[] {
  const seen = new Set<string>();
  return items.filter((item): item is SearchIntentLink => {
    if (!item) return false;
    const key = item.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
