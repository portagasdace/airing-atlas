export const ADSENSE_REVIEW_ANIME_LIKE_IDS = [16498, 101922, 113415, 1535, 20954, 13601] as const;

export const ADSENSE_REVIEW_WATCH_ORDER_IDS = [16498, 101922, 113415, 21, 20, 127230] as const;

export const ADSENSE_REVIEW_DISCOVER_SLUGS = [
  "dark-fantasy-anime",
  "mind-game-anime",
  "romance-drama-anime",
  "anime-with-smart-main-character"
] as const;

const reviewAnimeLikeIds = new Set<number>(ADSENSE_REVIEW_ANIME_LIKE_IDS);
const reviewWatchOrderIds = new Set<number>(ADSENSE_REVIEW_WATCH_ORDER_IDS);
const reviewDiscoverSlugs = new Set<string>(ADSENSE_REVIEW_DISCOVER_SLUGS);

export function isAdsenseReviewAnimeLike(animeId: number): boolean {
  return reviewAnimeLikeIds.has(animeId);
}

export function isAdsenseReviewWatchOrder(animeId: number): boolean {
  return reviewWatchOrderIds.has(animeId);
}

export function isAdsenseReviewDiscover(slug: string): boolean {
  return reviewDiscoverSlugs.has(slug);
}

export function isAdsenseReviewAdPath(pathname: string): boolean {
  return /^\/guides\/[^/]+\/$/.test(pathname);
}
