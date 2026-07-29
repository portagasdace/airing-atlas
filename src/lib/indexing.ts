import { allAnime, watchOrderIndex } from "@/lib/anime";
import { discoveryClusters } from "@/lib/discovery-clusters";
import { guides } from "@/lib/guides";
import { manualSimilarGuideFor, manualWatchOrderFor } from "@/lib/manual-content";
import { adsenseReviewAnimeLikePages, adsenseReviewWatchOrderGuides } from "@/lib/quality";
import { ADSENSE_REVIEW_DISCOVER_SLUGS } from "@/lib/review-mode";
import { animeLikeSlug } from "@/lib/search-intents";

export type IndexingStatus = "active" | "candidate";
export type IndexingSection = "core" | "guide" | "discover" | "anime-like" | "watch-order";

export interface IndexableRoute {
  path: string;
  section: IndexingSection;
  lastModified?: string;
  status: IndexingStatus;
  adsEligible: boolean;
}

const coreRoutes: IndexableRoute[] = [
  { path: "/", section: "core", status: "active", adsEligible: false },
  { path: "/editorial-policy/", section: "core", status: "active", adsEligible: false },
  { path: "/guides/", section: "core", status: "active", adsEligible: false },
  { path: "/anime-finder/", section: "core", status: "active", adsEligible: false },
  { path: "/binge-planner/", section: "core", status: "active", adsEligible: false },
  { path: "/watch-next/", section: "core", status: "active", adsEligible: false },
  { path: "/anime-like/", section: "core", status: "active", adsEligible: false },
  { path: "/watch-order/", section: "core", status: "active", adsEligible: false },
  { path: "/about/", section: "core", status: "candidate", adsEligible: false }
];

export function indexingRouteCatalog(): IndexableRoute[] {
  const guideRoutes: IndexableRoute[] = guides.map((guide) => ({
    path: `/guides/${guide.slug}/`,
    section: "guide",
    lastModified: guide.updated,
    status: guide.indexStatus,
    adsEligible: guide.adsEligible
  }));

  const discoverRoutes: IndexableRoute[] = discoveryClusters
    .filter((cluster) =>
      ADSENSE_REVIEW_DISCOVER_SLUGS.includes(
        cluster.slug as (typeof ADSENSE_REVIEW_DISCOVER_SLUGS)[number]
      )
    )
    .map((cluster) => ({
      path: `/discover/${cluster.slug}/`,
      section: "discover",
      lastModified: cluster.updated,
      status: "active",
      adsEligible: false
    }));

  const seenAnimeLike = new Set<string>();
  const animeLikeRoutes: IndexableRoute[] = adsenseReviewAnimeLikePages(allAnime)
    .flatMap((anime) => {
      const slug = animeLikeSlug(anime);
      if (!slug || seenAnimeLike.has(slug)) return [];
      seenAnimeLike.add(slug);
      return [{
        path: `/anime-like/${slug}/`,
        section: "anime-like" as const,
        lastModified: manualSimilarGuideFor(anime.id)?.updated,
        status: "active" as const,
        adsEligible: false
      }];
    });

  const watchOrderRoutes: IndexableRoute[] = adsenseReviewWatchOrderGuides(watchOrderIndex.items)
    .map((guide) => ({
      path: `/watch-order/${guide.slug}/`,
      section: "watch-order",
      lastModified: manualWatchOrderFor(guide.rootAnimeId)?.updated,
      status: "active",
      adsEligible: false
    }));

  return uniqueRoutes([
    ...coreRoutes,
    ...guideRoutes,
    ...discoverRoutes,
    ...animeLikeRoutes,
    ...watchOrderRoutes
  ]);
}

export function activeIndexableRoutes(): IndexableRoute[] {
  return indexingRouteCatalog().filter((route) => route.status === "active");
}

export function indexingRouteForPath(pathname: string): IndexableRoute | undefined {
  return indexingRouteCatalog().find((route) => route.path === normalizePath(pathname));
}

export function isIndexingCandidatePath(pathname: string): boolean {
  return indexingRouteForPath(pathname)?.status === "candidate";
}

function uniqueRoutes(routes: IndexableRoute[]): IndexableRoute[] {
  const seen = new Set<string>();
  return routes.filter((route) => {
    if (seen.has(route.path)) return false;
    seen.add(route.path);
    return true;
  });
}

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}
