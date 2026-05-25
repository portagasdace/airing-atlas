import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = process.env.ANILIST_API_ENDPOINT || "https://graphql.anilist.co";
const required = process.env.LIVE_ANILIST_REQUIRED === "true";

const now = new Date();
const CURRENT_YEAR = now.getUTCFullYear();
const CURRENT_SEASON = seasonForMonth(now.getUTCMonth());
const next = nextSeason(CURRENT_SEASON, CURRENT_YEAR);
const EXCLUDED_PUBLIC_GENRES = new Set(["Ecchi"]);

const RELATED_MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  startDate { year month day }
  season
  seasonYear
  format
  status
  source
  isAdult
  episodes
  duration
  averageScore
  meanScore
  popularity
  favourites
  genres
  coverImage { large extraLarge color }
  bannerImage
  siteUrl
  studios(isMain: true) { nodes { name } }
  tags { name rank category isGeneralSpoiler isMediaSpoiler }
  nextAiringEpisode { airingAt episode timeUntilAiring }
`;

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  startDate { year month day }
  season
  seasonYear
  format
  status
  source
  isAdult
  episodes
  duration
  averageScore
  meanScore
  popularity
  favourites
  genres
  coverImage { large extraLarge color }
  bannerImage
  siteUrl
  studios(isMain: true) { nodes { name } }
  tags { name rank category isGeneralSpoiler isMediaSpoiler }
  externalLinks { site url type language isDisabled }
  streamingEpisodes { title thumbnail url site }
  nextAiringEpisode { airingAt episode timeUntilAiring }
`;

const query = `
query AiringAtlas($season: MediaSeason, $seasonYear: Int, $nextSeason: MediaSeason, $nextSeasonYear: Int, $airingFrom: Int, $airingTo: Int) {
  current: Page(page: 1, perPage: 50) {
    media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC]) { ${MEDIA_FIELDS} }
  }
  next: Page(page: 1, perPage: 30) {
    media(type: ANIME, season: $nextSeason, seasonYear: $nextSeasonYear, sort: [POPULARITY_DESC]) { ${MEDIA_FIELDS} }
  }
  trending: Page(page: 1, perPage: 30) {
    media(type: ANIME, sort: [TRENDING_DESC]) { ${MEDIA_FIELDS} }
  }
  popular: Page(page: 1, perPage: 30) {
    media(type: ANIME, sort: [POPULARITY_DESC]) { ${MEDIA_FIELDS} }
  }
  topRated: Page(page: 1, perPage: 30) {
    media(type: ANIME, sort: [SCORE_DESC]) { ${MEDIA_FIELDS} }
  }
  schedule: Page(page: 1, perPage: 50) {
    airingSchedules(airingAt_greater: $airingFrom, airingAt_lesser: $airingTo, sort: [TIME]) {
      airingAt
      episode
      media { ${MEDIA_FIELDS} }
    }
  }
}`;

const enrichmentQuery = `
query AiringAtlasEnrichment($ids: [Int]) {
  Page(page: 1, perPage: 5) {
    media(id_in: $ids, type: ANIME) {
      id
      relations {
        edges {
          relationType(version: 2)
          node { ${RELATED_MEDIA_FIELDS} }
        }
      }
      recommendations(page: 1, perPage: 5, sort: [RATING_DESC]) {
        nodes {
          rating
          mediaRecommendation { ${RELATED_MEDIA_FIELDS} }
        }
      }
    }
  }
}`;

const BLOCKED_ADULT_PATTERNS = [
  /\bhentai\b/i,
  /\beroge\b/i,
  /\bnukige\b/i,
  /\banal\b/i,
  /\bananie\b/i,
  /\boppai\b/i,
  /\bpaizuri\b/i,
  /\bpanty\b/i,
  /\bpanties\b/i,
  /\bsex\b/i,
  /\bsexual\b/i,
  /seishidouin/i
];

async function main() {
  let data;
  let source = "anilist";

  try {
    data = await fetchAniList();
  } catch (error) {
    if (required) {
      throw error;
    }
    console.warn(`[sync] AniList unavailable, using fixture data: ${error.message}`);
    data = await fixtureData();
    source = "fixture";
  }

  const normalized = normalizeCatalog(data, source);
  await writeJson("src/data/generated/anime-catalog.json", normalized.catalog);
  await writeJson("src/data/generated/airing-calendar.json", normalized.calendar);
  await writeJson("src/data/generated/recommendation-index.json", normalized.recommendations);
  await writeJson("src/data/generated/watch-order-index.json", normalized.watchOrders);
  await writeJson("src/data/generated/genre-index.json", normalized.genres);
  await writeJson("src/data/generated/season-index.json", normalized.seasons);
  await writeJson("public/data/anime-index.json", normalized.catalog);
  await writeJson("public/data/airing-calendar.json", normalized.calendar);
  await writeJson("public/data/recommendation-index.json", normalized.recommendations);
  await writeJson("public/data/watch-order-index.json", normalized.watchOrders);
  await writeJson("public/data/genre-index.json", normalized.genres);
  await writeJson("public/data/season-index.json", normalized.seasons);
  console.log(`[sync] wrote ${normalized.catalog.anime.length} anime and ${normalized.calendar.entries.length} airing entries from ${source}`);
}

async function fetchAniList() {
  const airingFrom = Math.floor(Date.now() / 1000) - 60 * 60 * 12;
  const airingTo = airingFrom + 60 * 60 * 24 * 14;
  const json = await postGraphql(query, {
    season: CURRENT_SEASON,
    seasonYear: CURRENT_YEAR,
    nextSeason: next.season,
    nextSeasonYear: next.year,
    airingFrom,
    airingTo
  });
  await enrichAniListData(json.data);
  return json.data;
}

async function postGraphql(graphqlQuery, variables) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      query: graphqlQuery,
      variables
    })
  });

  const json = await response.json();
  if (!response.ok) {
    const message = json.errors?.map((item) => item.message).join("; ") || response.statusText;
    throw new Error(`AniList responded ${response.status}: ${message}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors.map((item) => item.message).join("; "));
  }
  return json;
}

async function enrichAniListData(data) {
  const seedIds = uniqueBy([
    ...(data.current?.media || []),
    ...(data.trending?.media || []),
    ...(data.popular?.media || []),
    ...(data.topRated?.media || []),
    ...(data.schedule?.airingSchedules || []).map((entry) => entry.media)
  ].filter(Boolean), (media) => media.id)
    .filter((media) => media?.id && isSafeAnime(media))
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 60)
    .map((media) => media.id);

  const enrichments = new Map();
  for (const ids of chunks(seedIds, 5)) {
    const json = await postGraphql(enrichmentQuery, { ids });
    for (const media of json.data?.Page?.media || []) {
      enrichments.set(media.id, media);
    }
  }

  const merge = (media) => {
    const enrichment = enrichments.get(media?.id);
    if (enrichment) {
      media.relations = enrichment.relations;
      media.recommendations = enrichment.recommendations;
    }
  };

  for (const key of ["current", "next", "trending", "popular", "topRated"]) {
    for (const media of data[key]?.media || []) merge(media);
  }
  for (const entry of data.schedule?.airingSchedules || []) merge(entry.media);
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function fixtureData() {
  const fixture = JSON.parse(await readFile(resolve(root, "scripts/fixtures/anime-fixture.json"), "utf8"));
  const anime = fixture.anime.map((item, index) => {
    const airingAt = Math.floor((Date.now() + (item.nextEpisodeOffsetHours || (index + 1) * 24) * 60 * 60 * 1000) / 1000);
    return {
      ...item,
      nextAiringEpisode: {
        airingAt,
        episode: index + 4,
        timeUntilAiring: Math.max(0, airingAt - Math.floor(Date.now() / 1000))
      }
    };
  });

  return {
    current: { media: anime },
    next: { media: anime.slice(0, 4) },
    trending: { media: [...anime].sort((a, b) => b.popularity - a.popularity) },
    popular: { media: [...anime].sort((a, b) => b.favourites - a.favourites) },
    topRated: { media: [...anime].sort((a, b) => b.averageScore - a.averageScore) },
    schedule: {
      airingSchedules: anime.map((media, index) => ({
        airingAt: media.nextAiringEpisode.airingAt,
        episode: index + 4,
        media
      }))
    }
  };
}

function normalizeCatalog(data, source) {
  const rankingKeys = ["current", "next", "trending", "popular", "topRated"];
  const map = new Map();

  for (const key of rankingKeys) {
    for (const media of data[key]?.media || []) {
      if (media?.id && isSafeAnime(media)) map.set(media.id, normalizeAnime(media));
    }
  }

  for (const entry of data.schedule?.airingSchedules || []) {
    if (entry.media?.id && isSafeAnime(entry.media)) map.set(entry.media.id, normalizeAnime(entry.media));
  }

  for (const media of rawMediaItems(data)) {
    for (const edge of media.relations?.edges || []) {
      if (edge.node?.id && isSafeAnime(edge.node) && !map.has(edge.node.id)) {
        map.set(edge.node.id, normalizeAnime(edge.node));
      }
    }
    for (const recommendation of media.recommendations?.nodes || []) {
      const node = recommendation.mediaRecommendation;
      if (node?.id && isSafeAnime(node) && !map.has(node.id)) {
        map.set(node.id, normalizeAnime(node));
      }
    }
  }

  const anime = [...map.values()]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .map((item, index) => ({
      ...item,
      editorialNote: index < 30 ? editorialNote(item, index) : item.editorialNote
    }));

  const allById = new Map(anime.map((item) => [item.id, item]));
  const recommendationIndex = buildRecommendationIndex(anime, allById);
  const watchOrderIndex = buildWatchOrderIndex(anime, allById);
  const genreIndex = buildGenreIndex(anime, entriesPreview(data));
  const seasonIndex = buildSeasonIndex(anime, entriesPreview(data));

  const rankings = {
    current: idsFor(data.current?.media),
    next: idsFor(data.next?.media),
    trending: idsFor(data.trending?.media),
    popular: idsFor(data.popular?.media),
    topRated: idsFor(data.topRated?.media)
  };

  const entries = (data.schedule?.airingSchedules || [])
    .filter((entry) => entry.media?.id && entry.airingAt && isSafeAnime(entry.media))
    .map((entry) => ({
      animeId: entry.media.id,
      title: titleFor(entry.media.title),
      episode: entry.episode,
      airingAt: entry.airingAt,
      slug: slugify(`${entry.media.id}-${titleFor(entry.media.title)}`),
      coverImage: entry.media.coverImage?.large || "",
      genres: entry.media.genres || []
    }))
    .sort((a, b) => a.airingAt - b.airingAt);

  return {
    catalog: {
      generatedAt: new Date().toISOString(),
      source,
      season: CURRENT_SEASON,
      seasonYear: CURRENT_YEAR,
      nextSeason: next.season,
      nextSeasonYear: next.year,
      rankings,
      anime
    },
    calendar: {
      generatedAt: new Date().toISOString(),
      source,
      entries,
      days: groupByUtcDay(entries)
    },
    recommendations: {
      generatedAt: new Date().toISOString(),
      source,
      items: recommendationIndex
    },
    watchOrders: {
      generatedAt: new Date().toISOString(),
      source,
      items: watchOrderIndex
    },
    genres: {
      generatedAt: new Date().toISOString(),
      source,
      items: genreIndex
    },
    seasons: {
      generatedAt: new Date().toISOString(),
      source,
      items: seasonIndex
    }
  };
}

function normalizeAnime(media) {
  const displayTitle = titleFor(media.title);
  const slug = slugify(`${media.id}-${displayTitle}`);
  return {
    id: media.id,
    slug,
    title: media.title || {},
    description: media.description || "",
    startDate: media.startDate || null,
    season: media.season || null,
    seasonYear: media.seasonYear || null,
    format: media.format || null,
    status: media.status || null,
    source: media.source || null,
    isAdult: Boolean(media.isAdult),
    episodes: media.episodes || null,
    duration: media.duration || null,
    averageScore: media.averageScore || null,
    meanScore: media.meanScore || null,
    popularity: media.popularity || 0,
    favourites: media.favourites || 0,
    genres: media.genres || [],
    coverImage: media.coverImage || {},
    bannerImage: media.bannerImage || "",
    siteUrl: media.siteUrl || "",
    studios: media.studios?.nodes || media.studios || [],
    tags: safeTags(media.tags),
    relations: safeRelations(media.relations?.edges || []),
    recommendations: safeRecommendations(media.recommendations?.nodes || []),
    externalLinks: safeExternalLinks(media.externalLinks || []),
    streamingEpisodes: safeStreamingEpisodes(media.streamingEpisodes || []),
    nextAiringEpisode: media.nextAiringEpisode || null
  };
}

function entriesPreview(data) {
  return (data.schedule?.airingSchedules || [])
    .filter((entry) => entry.media?.id && entry.airingAt && isSafeAnime(entry.media))
    .map((entry) => ({ animeId: entry.media.id, airingAt: entry.airingAt }));
}

function rawMediaItems(data) {
  return uniqueBy([
    ...(data.current?.media || []),
    ...(data.next?.media || []),
    ...(data.trending?.media || []),
    ...(data.popular?.media || []),
    ...(data.topRated?.media || []),
    ...(data.schedule?.airingSchedules || []).map((entry) => entry.media)
  ].filter(Boolean), (media) => media.id);
}

function safeTags(tags = []) {
  return tags
    .filter((tag) => tag?.name && !tag.isMediaSpoiler && !tag.isGeneralSpoiler)
    .sort((a, b) => (b.rank || 0) - (a.rank || 0))
    .slice(0, 10)
    .map((tag) => ({
      name: tag.name,
      rank: tag.rank || null,
      category: tag.category || null
    }));
}

function safeRelations(edges = []) {
  return edges
    .filter((edge) => edge?.node?.id && isSafeAnime(edge.node))
    .slice(0, 12)
    .map((edge) => relatedSummary(edge.node, edge.relationType));
}

function safeRecommendations(nodes = []) {
  return nodes
    .filter((node) => node?.mediaRecommendation?.id && isSafeAnime(node.mediaRecommendation))
    .slice(0, 8)
    .map((node) => {
      const media = node.mediaRecommendation;
      return {
        animeId: media.id,
        title: titleFor(media.title),
        slug: slugify(`${media.id}-${titleFor(media.title)}`),
        rating: node.rating || null,
        score: media.averageScore || media.meanScore || null,
        reason: "Recommended by AniList users for similar audience appeal.",
        signals: ["AniList user recommendation"],
        source: "anilist",
        coverImage: media.coverImage?.large || media.coverImage?.extraLarge || "",
        genres: media.genres || []
      };
    });
}

function safeExternalLinks(links = []) {
  return links
    .filter((link) => link?.url && link?.site && !link.isDisabled)
    .slice(0, 8)
    .map((link) => ({
      site: link.site,
      url: link.url,
      type: link.type || null,
      language: link.language || null,
      isDisabled: Boolean(link.isDisabled)
    }));
}

function safeStreamingEpisodes(episodes = []) {
  return episodes
    .filter((episode) => episode?.url && episode?.site)
    .slice(0, 6)
    .map((episode) => ({
      title: episode.title || null,
      url: episode.url,
      site: episode.site,
      thumbnail: episode.thumbnail || null
    }));
}

function relatedSummary(media, relationType = null) {
  return {
    animeId: media.id,
    title: titleFor(media.title),
    slug: slugify(`${media.id}-${titleFor(media.title)}`),
    relationType,
    format: media.format || null,
    status: media.status || null,
    season: media.season || null,
    seasonYear: media.seasonYear || null,
    episodes: media.episodes || null,
    averageScore: media.averageScore || media.meanScore || null,
    popularity: media.popularity || 0,
    startDate: media.startDate || null,
    coverImage: media.coverImage?.large || media.coverImage?.extraLarge || "",
    siteUrl: media.siteUrl || ""
  };
}

function buildRecommendationIndex(anime, allById) {
  return anime.map((item) => {
    const direct = (item.recommendations || [])
      .filter((recommendation) => recommendation.animeId !== item.id)
      .map((recommendation) => ({
        ...recommendation,
        reason: recommendation.reason || reasonFor(item, allById.get(recommendation.animeId)),
        signals: recommendation.signals?.length ? recommendation.signals : sharedSignals(item, allById.get(recommendation.animeId))
      }));

    const seen = new Set(direct.map((recommendation) => recommendation.animeId));
    const fallback = anime
      .filter((candidate) => candidate.id !== item.id && !seen.has(candidate.id))
      .map((candidate) => ({
        candidate,
        score: similarityScore(item, candidate),
        signals: sharedSignals(item, candidate)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || (b.candidate.popularity || 0) - (a.candidate.popularity || 0))
      .slice(0, Math.max(0, 8 - direct.length))
      .map(({ candidate, score, signals }) => ({
        animeId: candidate.id,
        title: titleFor(candidate.title),
        slug: candidate.slug,
        rating: null,
        score,
        reason: reasonFor(item, candidate),
        signals,
        source: "similarity",
        coverImage: candidate.coverImage?.large || candidate.coverImage?.extraLarge || "",
        genres: candidate.genres || []
      }));

    return {
      animeId: item.id,
      slug: item.slug,
      title: titleFor(item.title),
      recommendations: [...direct, ...fallback].slice(0, 8)
    };
  });
}

function similarityScore(base, candidate) {
  const baseGenres = new Set(base.genres || []);
  const candidateGenres = new Set(candidate.genres || []);
  const sharedGenres = [...baseGenres].filter((genre) => candidateGenres.has(genre)).length;
  const baseTags = new Set((base.tags || []).slice(0, 6).map((tag) => tag.name));
  const candidateTags = new Set((candidate.tags || []).slice(0, 6).map((tag) => tag.name));
  const sharedTags = [...baseTags].filter((tag) => candidateTags.has(tag)).length;
  const sameStudio = firstStudio(base) && firstStudio(base) === firstStudio(candidate) ? 1 : 0;
  const sameFormat = base.format && base.format === candidate.format ? 1 : 0;
  const scoreGap = Math.abs((base.averageScore || base.meanScore || 0) - (candidate.averageScore || candidate.meanScore || 0));
  const scoreAffinity = scoreGap && scoreGap <= 8 ? 1 : 0;
  return sharedGenres * 5 + sharedTags * 4 + sameStudio * 4 + sameFormat * 2 + scoreAffinity;
}

function sharedSignals(base, candidate) {
  if (!candidate) return ["Similar audience profile"];
  const signals = [];
  const sharedGenres = (base.genres || []).filter((genre) => (candidate.genres || []).includes(genre)).slice(0, 3);
  if (sharedGenres.length) signals.push(`Shared genres: ${sharedGenres.join(", ")}`);
  const sharedTags = (base.tags || [])
    .map((tag) => tag.name)
    .filter((tag) => (candidate.tags || []).some((candidateTag) => candidateTag.name === tag))
    .slice(0, 2);
  if (sharedTags.length) signals.push(`Shared themes: ${sharedTags.join(", ")}`);
  if (firstStudio(base) && firstStudio(base) === firstStudio(candidate)) signals.push(`Same studio: ${firstStudio(base)}`);
  if (base.format && base.format === candidate.format) signals.push(`Same format: ${base.format}`);
  if (!signals.length) signals.push("Similar score and audience popularity");
  return signals;
}

function reasonFor(base, candidate) {
  return sharedSignals(base, candidate)[0] || "Similar score and audience popularity";
}

function firstStudio(anime) {
  return anime?.studios?.[0]?.name || null;
}

function buildWatchOrderIndex(anime, allById) {
  return anime
    .filter((item) => (item.popularity || 0) > 10000 && (item.relations || []).length >= 2)
    .slice(0, 80)
    .map((item) => {
      const entries = [
        relatedSummary(item, "MAIN"),
        ...(item.relations || [])
          .map((relation) => allById.get(relation.animeId) ? relatedSummary(allById.get(relation.animeId), relation.relationType) : relation)
      ];
      const unique = uniqueBy(entries, (entry) => entry.animeId)
        .sort((a, b) => watchOrderWeight(a) - watchOrderWeight(b));
      return {
        slug: item.slug,
        rootAnimeId: item.id,
        title: `${titleFor(item.title)} watch order`,
        description: `A compact viewing order for ${titleFor(item.title)} and its connected anime entries.`,
        entries: unique
      };
    })
    .filter((guide) => guide.entries.length >= 3);
}

function watchOrderWeight(entry) {
  const date = dateWeight(entry.startDate);
  const relation = String(entry.relationType || "");
  const relationOffset = relation === "PREQUEL" ? -20 : relation === "MAIN" ? 0 : relation === "SEQUEL" ? 20 : 40;
  return date + relationOffset;
}

function dateWeight(date) {
  if (!date?.year) return 99999999;
  return date.year * 10000 + (date.month || 1) * 100 + (date.day || 1);
}

function buildGenreIndex(anime, airingEntries) {
  const airingIds = new Set(airingEntries.map((entry) => entry.animeId));
  const groups = new Map();
  for (const item of anime) {
    for (const genre of item.genres || []) {
      if (EXCLUDED_PUBLIC_GENRES.has(genre)) continue;
      if (!groups.has(genre)) groups.set(genre, []);
      groups.get(genre).push(item);
    }
  }
  return [...groups.entries()]
    .map(([genre, items]) => {
      const sorted = items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return {
        genre,
        slug: slugify(genre),
        count: sorted.length,
        topIds: sorted.slice(0, 24).map((item) => item.id),
        airingIds: sorted.filter((item) => airingIds.has(item.id)).slice(0, 16).map((item) => item.id)
      };
    })
    .filter((item) => item.count >= 8)
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
}

function buildSeasonIndex(anime, airingEntries) {
  const airingIds = new Set(airingEntries.map((entry) => entry.animeId));
  const groups = new Map();
  for (const item of anime) {
    if (!item.season || !item.seasonYear) continue;
    const key = `${item.seasonYear}-${item.season}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()]
    .map(([key, items]) => {
      const [seasonYear, season] = key.split("-");
      const sorted = items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      return {
        slug: `${seasonYear}-${slugify(season)}`,
        season,
        seasonYear: Number(seasonYear),
        count: sorted.length,
        topIds: sorted.slice(0, 24).map((item) => item.id),
        airingIds: sorted.filter((item) => airingIds.has(item.id)).slice(0, 16).map((item) => item.id)
      };
    })
    .filter((item) => item.count >= 10)
    .sort((a, b) => b.seasonYear - a.seasonYear || seasonSort(a.season) - seasonSort(b.season));
}

function seasonSort(season) {
  return ["WINTER", "SPRING", "SUMMER", "FALL"].indexOf(season);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupByUtcDay(entries) {
  const days = new Map();
  for (const entry of entries) {
    const key = new Date(entry.airingAt * 1000).toISOString().slice(0, 10);
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(entry);
  }
  return [...days.entries()].map(([date, items]) => ({ date, items }));
}

function idsFor(media = []) {
  return media.filter((item) => item?.id && isSafeAnime(item)).map((item) => item.id);
}

function titleFor(title = {}) {
  return title.english || title.romaji || title.native || "Untitled Anime";
}

function isSafeAnime(media) {
  if (!media || media.isAdult) return false;
  const genres = (media.genres || []).join(" ");
  const title = [media.title?.english, media.title?.romaji, media.title?.native].filter(Boolean).join(" ");
  const haystack = `${title} ${genres} ${media.description || ""}`;
  return !BLOCKED_ADULT_PATTERNS.some((pattern) => pattern.test(haystack));
}

function slugify(value) {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "-");
}

function editorialNote(anime, index) {
  const title = titleFor(anime.title);
  const genres = (anime.genres || []).slice(0, 2).join(" and ") || "seasonal";
  const rank = index + 1;
  return `Atlas note: ${title} is a high-signal pick in the current catalog, ranking #${rank} by audience attention in our build. Use this page to compare its ${genres.toLowerCase()} profile, airing status, score, and official links before adding it to your watchlist.`;
}

function seasonForMonth(month) {
  if (month <= 2) return "WINTER";
  if (month <= 5) return "SPRING";
  if (month <= 8) return "SUMMER";
  return "FALL";
}

function nextSeason(season, year) {
  const order = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const index = order.indexOf(season);
  const nextIndex = (index + 1) % order.length;
  return {
    season: order[nextIndex],
    year: nextIndex === 0 ? year + 1 : year
  };
}

async function writeJson(path, value) {
  const absolute = resolve(root, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
