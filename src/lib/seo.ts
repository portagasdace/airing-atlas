import { canonicalPath } from "@/lib/anime";
import type { AnimeSummary, GenreIndexItem, SeasonIndexItem, WatchOrderGuide } from "@/types/anime";

type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Airing Atlas",
      url: canonicalPath("/"),
      potentialAction: {
        "@type": "SearchAction",
        target: canonicalPath("/discover/?q={search_term_string}"),
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Airing Atlas",
      url: canonicalPath("/"),
      logo: canonicalPath("/og-default.svg")
    }
  ];
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalPath(item.path)
    }))
  };
}

export function animeJsonLd(anime: AnimeSummary, title: string, description: string, image: string): JsonLd {
  const sameAs = [anime.siteUrl, ...(anime.externalLinks || []).map((link) => link.url)].filter(Boolean);
  return compactJsonLd({
    "@context": "https://schema.org",
    "@type": anime.format === "MOVIE" ? "Movie" : "TVSeries",
    name: title,
    url: canonicalPath(`/anime/${anime.slug}/`),
    image: absoluteUrl(image),
    description,
    genre: anime.genres,
    keywords: animeKeywords(anime, title),
    numberOfEpisodes: anime.episodes || undefined,
    datePublished: fuzzyIsoDate(anime.startDate),
    sameAs: sameAs.length ? sameAs : undefined
  });
}

export function watchOrderJsonLd(guide: WatchOrderGuide): JsonLd[] {
  return [
    breadcrumbJsonLd([
      { name: "Airing Atlas", path: "/" },
      { name: "Watch Order", path: "/watch-order/" },
      { name: guide.title, path: `/watch-order/${guide.slug}/` }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: guide.title,
      description: guide.description,
      url: canonicalPath(`/watch-order/${guide.slug}/`),
      itemListElement: guide.entries.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.title,
        url: canonicalPath(`/anime/${entry.slug}/`)
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `How should I watch ${guide.title.replace(/ watch order$/i, "")}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: "Start with the main series, then use the listed sequel, prequel, movie, OVA, and special labels as a compact franchise map."
          }
        },
        {
          "@type": "Question",
          name: "Does Airing Atlas provide anime streaming?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Airing Atlas is a schedule, discovery, and watchlist tool. It links to official or legal information sources where available."
          }
        }
      ]
    }
  ];
}

export function collectionPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
  items: Array<{ title: { english?: string | null; romaji?: string | null; native?: string | null }; slug: string }>;
}): JsonLd[] {
  return [
    breadcrumbJsonLd([
      { name: "Airing Atlas", path: "/" },
      { name: options.name, path: options.path }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: options.name,
      description: options.description,
      url: canonicalPath(options.path),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: options.items.slice(0, 12).map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title.english || item.title.romaji || item.title.native || "Untitled Anime",
          url: canonicalPath(`/anime/${item.slug}/`)
        }))
      }
    }
  ];
}

export function genrePageJsonLd(genre: GenreIndexItem, items: Parameters<typeof collectionPageJsonLd>[0]["items"]): JsonLd[] {
  const name = `${genre.genre} Anime`;
  return collectionPageJsonLd({
    name,
    description: `Popular ${genre.genre.toLowerCase()} anime and current airing picks on Airing Atlas.`,
    path: `/genres/${genre.slug}/`,
    items
  });
}

export function seasonPageJsonLd(season: SeasonIndexItem, label: string, items: Parameters<typeof collectionPageJsonLd>[0]["items"]): JsonLd[] {
  return collectionPageJsonLd({
    name: `${label} Anime`,
    description: `Popular and airing anime from ${label} on Airing Atlas.`,
    path: `/seasons/${season.seasonYear}/${season.season.toLowerCase()}/`,
    items
  });
}

export function webAppJsonLd(name: string, description: string, path: string): JsonLd[] {
  return [
    breadcrumbJsonLd([
      { name: "Airing Atlas", path: "/" },
      { name, path }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name,
      description,
      url: canonicalPath(path),
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Any"
    }
  ];
}

function fuzzyIsoDate(date?: AnimeSummary["startDate"]): string | undefined {
  if (!date?.year) return undefined;
  const month = String(date.month || 1).padStart(2, "0");
  const day = String(date.day || 1).padStart(2, "0");
  return `${date.year}-${month}-${day}`;
}

function absoluteUrl(value: string): string {
  return value.startsWith("http") ? value : canonicalPath(value);
}

function animeKeywords(anime: AnimeSummary, title: string): string {
  return [
    title,
    `${title} anime`,
    `anime like ${title}`,
    `${title} recommendations`,
    `${title} watch order`,
    `${title} next episode`,
    ...(anime.genres || []).map((genre) => `${genre} anime`),
    ...(anime.tags || []).map((tag) => tag.name).filter(Boolean).slice(0, 6)
  ]
    .filter(Boolean)
    .slice(0, 18)
    .join(", ");
}

function compactJsonLd(value: JsonLd): JsonLd {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== null && entry !== ""));
}
