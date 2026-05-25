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

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  season
  seasonYear
  format
  status
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
  await writeJson("public/data/anime-index.json", normalized.catalog);
  await writeJson("public/data/airing-calendar.json", normalized.calendar);
  console.log(`[sync] wrote ${normalized.catalog.anime.length} anime and ${normalized.calendar.entries.length} airing entries from ${source}`);
}

async function fetchAniList() {
  const airingFrom = Math.floor(Date.now() / 1000) - 60 * 60 * 12;
  const airingTo = airingFrom + 60 * 60 * 24 * 14;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: {
        season: CURRENT_SEASON,
        seasonYear: CURRENT_YEAR,
        nextSeason: next.season,
        nextSeasonYear: next.year,
        airingFrom,
        airingTo
      }
    })
  });

  if (!response.ok) {
    throw new Error(`AniList responded ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((item) => item.message).join("; "));
  }
  return json.data;
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

  const anime = [...map.values()]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .map((item, index) => ({
      ...item,
      editorialNote: index < 20 ? editorialNote(item, index) : item.editorialNote
    }));

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
    }
  };
}

function normalizeAnime(media) {
  const displayTitle = titleFor(media.title);
  return {
    id: media.id,
    slug: slugify(`${media.id}-${displayTitle}`),
    title: media.title || {},
    description: media.description || "",
    season: media.season || null,
    seasonYear: media.seasonYear || null,
    format: media.format || null,
    status: media.status || null,
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
    nextAiringEpisode: media.nextAiringEpisode || null
  };
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
