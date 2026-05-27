import { cleanText, displayTitle } from "@/lib/anime";
import type { AnimeSummary } from "@/types/anime";

export interface DiscoveryCluster {
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  intro: string;
  criteria: string[];
  genres?: string[];
  tagKeywords?: string[];
  titleKeywords?: string[];
  highlightAnimeIds: number[];
  relatedGuideIds: number[];
}

export const discoveryClusters: DiscoveryCluster[] = [
  {
    slug: "dark-fantasy-anime",
    title: "Dark Fantasy Anime",
    shortLabel: "Dark fantasy",
    description: "A curated guide to dark fantasy anime with monsters, survival pressure, violent worlds, and high-stakes character choices.",
    intro: "Use this page when you want fantasy anime that feels dangerous rather than cozy: monsters, cursed powers, survival horror, war, and stories where the world keeps asking for a cost.",
    criteria: ["fantasy or supernatural setting", "dangerous worldbuilding", "serious character stakes", "strong audience signal"],
    genres: ["Action", "Fantasy", "Supernatural", "Horror", "Drama"],
    tagKeywords: ["Dark Fantasy", "Survival", "Tragedy", "Demons", "War", "Gore", "Monster"],
    highlightAnimeIds: [16498, 101922, 113415, 127230, 5114],
    relatedGuideIds: [16498, 101922, 113415, 127230]
  },
  {
    slug: "battle-shounen-anime",
    title: "Battle Shounen Anime",
    shortLabel: "Battle shounen",
    description: "Popular battle shounen anime with training arcs, rivalries, tournaments, power systems, and long-term team growth.",
    intro: "This route is for fans who want momentum: rivalries, power systems, tournament energy, mentor figures, and fights that reveal character as much as strength.",
    criteria: ["action-forward pacing", "clear power or combat system", "team or rivalry structure", "strong beginner appeal"],
    genres: ["Action", "Adventure", "Fantasy", "Supernatural"],
    tagKeywords: ["Shounen", "Super Power", "Martial Arts", "Tournaments", "Male Protagonist", "Ensemble Cast"],
    highlightAnimeIds: [20, 21, 101922, 113415, 21459, 11061],
    relatedGuideIds: [20, 21, 101922, 113415, 21459, 11061]
  },
  {
    slug: "mind-game-anime",
    title: "Mind Game Anime",
    shortLabel: "Mind games",
    description: "Anime built around strategy, psychological pressure, crime, manipulation, and clever character decisions.",
    intro: "These picks are for viewers who like watching characters think under pressure: plans, traps, betrayals, moral puzzles, and tense conversations where a single mistake matters.",
    criteria: ["strategy or psychological tension", "characters solving problems under pressure", "strong suspense hook", "minimal reliance on filler material"],
    genres: ["Drama", "Psychological", "Mystery", "Thriller", "Supernatural"],
    tagKeywords: ["Psychological", "Crime", "Detective", "Strategy Game", "Anti-Hero", "Genius", "Memory Manipulation"],
    highlightAnimeIds: [1535, 16498, 5114, 11061],
    relatedGuideIds: [1535, 16498, 5114]
  },
  {
    slug: "long-running-adventure-anime",
    title: "Long-Running Adventure Anime",
    shortLabel: "Long adventures",
    description: "Long-running adventure anime for viewers who want big casts, long arcs, travel, friendship, and years of story to follow.",
    intro: "Start here if you want a show that can become a long-term project: large worlds, recurring crews, long arcs, changing villains, and a watchlist that actually needs organization.",
    criteria: ["large story world", "many episodes or franchise entries", "adventure structure", "clear main-series path"],
    genres: ["Adventure", "Action", "Fantasy", "Comedy"],
    tagKeywords: ["Travel", "Pirates", "Ninja", "Ensemble Cast", "Coming of Age", "Super Power"],
    highlightAnimeIds: [21, 20, 11061, 21459],
    relatedGuideIds: [21, 20, 11061, 21459]
  },
  {
    slug: "supernatural-action-anime",
    title: "Supernatural Action Anime",
    shortLabel: "Supernatural action",
    description: "Supernatural action anime with curses, demons, ghosts, powers, exorcists, and monster-fighting teams.",
    intro: "This cluster focuses on modern action shows where the threat is supernatural: curses, demons, spirits, devils, and fighters trying to keep a normal world from cracking open.",
    criteria: ["supernatural threat", "action-focused episodes", "memorable power rules", "good fit for similar-anime searches"],
    genres: ["Action", "Supernatural", "Fantasy", "Horror"],
    tagKeywords: ["Demons", "Ghost", "Youkai", "Urban Fantasy", "Super Power", "Exorcism", "Monster"],
    highlightAnimeIds: [113415, 101922, 127230, 20],
    relatedGuideIds: [113415, 101922, 127230]
  },
  {
    slug: "emotional-drama-anime",
    title: "Emotional Drama Anime",
    shortLabel: "Emotional drama",
    description: "Emotional anime drama picks with grief, friendship, sacrifice, recovery, family pressure, and character-first storytelling.",
    intro: "Use this guide when the important part is not just action or plot mechanics, but whether a show leaves an emotional mark through grief, loyalty, sacrifice, or recovery.",
    criteria: ["character-first conflict", "clear emotional arc", "strong ending or turning points", "useful for fans moving beyond pure action"],
    genres: ["Drama", "Slice of Life", "Romance", "Adventure"],
    tagKeywords: ["Tragedy", "Coming of Age", "Family Life", "Rehabilitation", "Friendship", "Bullying"],
    highlightAnimeIds: [5114, 11061, 16498, 101922],
    relatedGuideIds: [5114, 11061, 16498]
  },
  {
    slug: "romance-drama-anime",
    title: "Romance Drama Anime",
    shortLabel: "Romance drama",
    description: "Romance drama anime with relationship tension, school life, emotional growth, comedy, and bittersweet character arcs.",
    intro: "This page is for viewers who want the relationship side of anime discovery: romantic tension, school-life pressure, personal growth, comedy, and stories that can be warm without being empty.",
    criteria: ["romance or relationship focus", "emotional character growth", "clear seasonal or completed path", "accessible starting point"],
    genres: ["Romance", "Drama", "Comedy", "Slice of Life"],
    tagKeywords: ["School", "Love Triangle", "Coming of Age", "Female Protagonist", "Male Protagonist", "Family Life"],
    highlightAnimeIds: [4224, 13759, 4081, 23273],
    relatedGuideIds: [1535, 5114, 11061]
  },
  {
    slug: "anime-with-smart-main-character",
    title: "Anime With Smart Main Characters",
    shortLabel: "Smart leads",
    description: "Anime where smart main characters solve problems through strategy, deduction, planning, manipulation, or tactical combat.",
    intro: "This guide is for users searching less by genre and more by protagonist type: clever leads, tacticians, detectives, planners, and characters who win because they understand the board.",
    criteria: ["strategic or analytical lead", "problem-solving scenes", "clear stakes for decisions", "good overlap with mind-game searches"],
    genres: ["Drama", "Mystery", "Psychological", "Action", "Sci-Fi"],
    tagKeywords: ["Genius", "Anti-Hero", "Detective", "Strategy Game", "Crime", "Politics", "Military"],
    titleKeywords: ["note", "code", "detective", "classroom", "legend"],
    highlightAnimeIds: [1535, 5114, 16498, 11061],
    relatedGuideIds: [1535, 5114, 16498, 11061]
  }
];

export function discoveryClusterBySlug(slug: string): DiscoveryCluster | undefined {
  return discoveryClusters.find((cluster) => cluster.slug === slug);
}

export function rankedClusterAnime(cluster: DiscoveryCluster, items: AnimeSummary[]): AnimeSummary[] {
  return items
    .map((anime) => ({
      anime,
      score: clusterScore(cluster, anime)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.anime.popularity || 0) - (a.anime.popularity || 0))
    .map((item) => item.anime);
}

export function clusterReason(cluster: DiscoveryCluster, anime: AnimeSummary): string {
  const title = displayTitle(anime);
  const sharedGenres = (anime.genres || []).filter((genre) => cluster.genres?.includes(genre)).slice(0, 3);
  const matchedTags = (anime.tags || [])
    .map((tag) => tag.name || "")
    .filter((tag) => cluster.tagKeywords?.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())))
    .slice(0, 2);

  if (cluster.highlightAnimeIds.includes(anime.id)) {
    return `${title} is a strong reference point for this guide, with enough audience signal to anchor the cluster.`;
  }
  if (sharedGenres.length && matchedTags.length) {
    return `Fits through ${sharedGenres.join(", ")} plus themes like ${matchedTags.join(", ")}.`;
  }
  if (sharedGenres.length) {
    return `Fits the guide through shared genres: ${sharedGenres.join(", ")}.`;
  }
  if (matchedTags.length) {
    return `Fits the guide through matching themes: ${matchedTags.join(", ")}.`;
  }
  return cleanText(anime.description || "", 130) || "A useful adjacent pick for this discovery route.";
}

function clusterScore(cluster: DiscoveryCluster, anime: AnimeSummary): number {
  const title = displayTitle(anime).toLowerCase();
  const description = String(anime.description || "").toLowerCase();
  const tags = (anime.tags || []).map((tag) => tag.name || "").join(" ").toLowerCase();
  const genres = new Set(anime.genres || []);
  let score = 0;

  if (cluster.highlightAnimeIds.includes(anime.id)) score += 80;
  for (const genre of cluster.genres || []) {
    if (genres.has(genre)) score += 12;
  }
  for (const keyword of cluster.tagKeywords || []) {
    const normalized = keyword.toLowerCase();
    if (tags.includes(normalized)) score += 10;
    if (description.includes(normalized)) score += 3;
  }
  for (const keyword of cluster.titleKeywords || []) {
    if (title.includes(keyword.toLowerCase())) score += 6;
  }
  if ((anime.popularity || 0) > 50000) score += 4;
  if ((anime.averageScore || anime.meanScore || 0) >= 80) score += 3;
  return score;
}
