import { cleanText, displayTitle } from "@/lib/anime";
import type { AnimeSummary } from "@/types/anime";

export interface DiscoveryCluster {
  slug: string;
  title: string;
  shortLabel: string;
  updated?: string;
  description: string;
  intro: string;
  fitNote: string;
  bestFor?: string;
  avoidIf?: string;
  editorialReasons?: Record<number, string>;
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
    updated: "2026-07-29",
    description: "A curated guide to dark fantasy anime with monsters, survival pressure, violent worlds, and high-stakes character choices.",
    intro: "Use this page when you want fantasy anime that feels dangerous rather than cozy: monsters, cursed powers, survival horror, war, and stories where the world keeps asking for a cost.",
    fitNote: "Picks are favored when the fantasy element creates pressure instead of comfort: cursed power, body horror, war, survival stakes, or choices that leave lasting damage.",
    bestFor: "Choose this route when you want danger, moral cost, and worldbuilding that keeps tightening around the cast. It is strongest for viewers who enjoy horror pressure or political consequences alongside fantasy action.",
    avoidIf: "Skip this route when you mainly want cozy fantasy, low-conflict escapism, or light adventure. Several picks use graphic violence, grief, body horror, or prolonged threat as part of their appeal.",
    editorialReasons: {
      16498: "Attack on Titan is the political-survival anchor: its monsters open the story, but military secrecy and the cost of choosing a side make it a lasting dark-fantasy match.",
      101922: "Demon Slayer is the most accessible entry, pairing demon horror and family loss with a clear emotional objective and readable arc structure.",
      113415: "Jujutsu Kaisen moves the route into urban curses, where dangerous power systems and institutional failures matter as much as the fights.",
      127230: "Chainsaw Man is the messiest horror-comedy option, built around devils, exploitation, damaged wants, and sudden violence rather than heroic certainty.",
      5114: "Fullmetal Alchemist: Brotherhood is the complete long-form option, using alchemy, war crimes, sacrifice, and political conspiracy without abandoning adventure."
    },
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
    fitNote: "The list favors shows where combat has a readable rule set and the cast grows through rivals, mentors, teams, exams, tournaments, or repeated arcs.",
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
    updated: "2026-07-29",
    description: "Anime built around strategy, psychological pressure, crime, manipulation, and clever character decisions.",
    intro: "These picks are for viewers who like watching characters think under pressure: plans, traps, betrayals, moral puzzles, and tense conversations where a single mistake matters.",
    fitNote: "A title fits when the main pleasure is watching decisions, traps, deductions, and consequences unfold, not just waiting for the next fight.",
    bestFor: "Use this guide when plans, deductions, manipulation, and changing information are the main source of tension. It suits viewers who enjoy pausing to test a character's logic or predict the next counter-move.",
    avoidIf: "Choose another route if you want immediate action, simple heroes and villains, or a story that explains every rule quickly. Several picks reward patience and attention to motives.",
    editorialReasons: {
      1535: "Death Note is the clearest starting point because every major turn comes from rules, hidden information, pride, and two opponents trying to predict each other.",
      16498: "Attack on Titan becomes a strategic match once survival expands into military deception, political factions, and decisions with no clean outcome.",
      5114: "Fullmetal Alchemist: Brotherhood balances investigation and action, with conspiracies that reward viewers for tracking institutions, motives, and the cost of each shortcut.",
      11061: "Hunter x Hunter is the tactical-combat choice: its best confrontations are decided by conditions, psychology, preparation, and reading an opponent rather than raw power."
    },
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
    fitNote: "These picks earn their place through sustained world travel, changing arcs, large casts, and a main path that can support weeks or months of watching.",
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
    fitNote: "A match needs both sides of the phrase: supernatural threats plus enough action momentum to make it useful for fans moving from Demon Slayer, Jujutsu Kaisen, or Chainsaw Man.",
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
    fitNote: "The ranking favors shows where character change is central: grief, friendship, guilt, recovery, sacrifice, or a turning point that makes the ending matter.",
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
    updated: "2026-07-29",
    description: "Romance drama anime with relationship tension, school life, emotional growth, comedy, and bittersweet character arcs.",
    intro: "This page is for viewers who want the relationship side of anime discovery: romantic tension, school-life pressure, personal growth, comedy, and stories that can be warm without being empty.",
    fitNote: "Picks are chosen for relationship tension and emotional movement first, then filtered for accessibility, completed paths, and enough audience signal to be useful.",
    bestFor: "Choose this route when the relationship must change the characters rather than simply decorate the plot. The strongest picks combine attraction with grief, timing, family pressure, or the difficulty of saying what someone needs.",
    avoidIf: "This is not the best route for viewers seeking romance-free comedy or constant action. Several picks are patient, bittersweet, and more interested in emotional consequences than a fast confession.",
    editorialReasons: {
      4224: "Toradora! is the accessible school-romance anchor, using comedy and mistaken expectations before allowing its leads to confront what they actually need.",
      13759: "The Pet Girl of Sakurasou adds creative ambition and uneven talent to the relationship pressure, making personal growth as important as pairing the cast.",
      4081: "Natsume's Book of Friends offers the gentlest adjacent route, favoring loneliness, trust, and quiet connection over conventional romantic momentum.",
      23273: "Your Lie in April is the heavier emotional choice, combining performance, grief, admiration, and the way a relationship can change someone's willingness to live openly."
    },
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
    updated: "2026-07-29",
    description: "Anime where smart main characters solve problems through strategy, deduction, planning, manipulation, or tactical combat.",
    intro: "This guide is for users searching less by genre and more by protagonist type: clever leads, tacticians, detectives, planners, and characters who win because they understand the board.",
    fitNote: "A title fits when the lead's intelligence changes the outcome: deduction, planning, politics, combat rules, manipulation, or careful reading of the opponent.",
    bestFor: "Use this list when you want the protagonist's reasoning to create the payoff. The selected leads win information, negotiations, investigations, or tactical exchanges before they win through force.",
    avoidIf: "Avoid this route if a powerful lead is enough on its own. These picks require visible decisions and consequences; effortless strength without planning is not treated as intelligence.",
    editorialReasons: {
      1535: "Light Yagami is the manipulation benchmark: his intelligence drives both the attraction and the moral collapse of Death Note's central contest.",
      5114: "Edward and Alphonse solve problems through research, trade-offs, and institutional investigation, making intelligence part of a complete adventure rather than a single gimmick.",
      16498: "Armin anchors Attack on Titan here because observation, negotiation, and high-risk planning repeatedly alter outcomes that strength alone cannot solve.",
      11061: "Hunter x Hunter earns its place through tactical adaptation: characters explain conditions, test assumptions, and change plans while a fight is still moving."
    },
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
    return cluster.editorialReasons?.[anime.id] || `${title} is a strong reference point for this guide, with enough audience signal to anchor the cluster.`;
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
