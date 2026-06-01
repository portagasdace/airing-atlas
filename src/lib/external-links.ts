import type { AnimeSummary } from "@/types/anime";

type ExternalLink = NonNullable<AnimeSummary["externalLinks"]>[number];

const sitePriority = [
  "official site",
  "crunchyroll",
  "netflix",
  "hulu",
  "hidive",
  "disney",
  "adult swim",
  "amazon prime video",
  "tubi tv",
  "bilibili",
  "iq",
  "wetv",
  "youtube",
  "twitter",
  "x",
  "facebook"
];

const httpsHosts = new Set([
  "adultswim.com",
  "amazon.com",
  "bilibili.tv",
  "crunchyroll.com",
  "facebook.com",
  "hoopladigital.com",
  "hulu.com",
  "iq.com",
  "netflix.com",
  "tubitv.com",
  "twitter.com",
  "wetv.vip",
  "www.adultswim.com",
  "www.amazon.com",
  "www.bilibili.tv",
  "www.crunchyroll.com",
  "www.facebook.com",
  "www.hoopladigital.com",
  "www.hulu.com",
  "www.iq.com",
  "www.netflix.com",
  "www.tubitv.com",
  "www.youtube.com",
  "x.com",
  "youtube.com",
  "youtu.be"
]);

function siteKey(site = ""): string {
  return site.trim().toLowerCase().replace(/\s+/g, " ");
}

function urlKey(url = ""): string {
  return normalizeExternalUrl(url)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function linkRank(link: ExternalLink): number {
  const key = siteKey(link.site || "");
  const priority = sitePriority.findIndex((site) => key.includes(site));
  const siteScore = priority === -1 ? 99 : priority;
  const languageScore = !link.language || link.language.toUpperCase() === "ENGLISH" ? 0 : 5;
  const typeScore = link.type === "SOCIAL" ? 4 : 0;
  const dubScore = /dub/i.test(link.url || "") ? 2 : 0;
  return siteScore * 10 + languageScore + typeScore + dubScore;
}

export function normalizeExternalUrl(url = ""): string {
  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" && httpsHosts.has(parsed.hostname.toLowerCase())) {
      parsed.protocol = "https:";
    }
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function dedupeExternalLinks(links: AnimeSummary["externalLinks"] = [], limit = 5): ExternalLink[] {
  const seenSites = new Set<string>();
  const seenUrls = new Set<string>();

  return links
    .filter((link): link is ExternalLink => Boolean(link?.url && link?.site && !link.isDisabled))
    .map((link) => ({
      ...link,
      site: link.site?.trim(),
      url: normalizeExternalUrl(link.url || "")
    }))
    .sort((a, b) => linkRank(a) - linkRank(b))
    .filter((link) => {
      const normalizedSite = siteKey(link.site || "");
      const normalizedUrl = urlKey(link.url || "");
      if (!normalizedSite || !normalizedUrl || seenSites.has(normalizedSite) || seenUrls.has(normalizedUrl)) {
        return false;
      }
      seenSites.add(normalizedSite);
      seenUrls.add(normalizedUrl);
      return true;
    })
    .slice(0, limit);
}

