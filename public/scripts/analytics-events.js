(() => {
  const clean = (value = "", max = 80) => String(value).replace(/\s+/g, " ").trim().slice(0, max);
  const path = () => window.location.pathname;
  const profileKey = "airing-atlas-audience-profile-v1";
  const sessionKey = "airing-atlas-audience-session-v1";
  const watchlistKey = "airing-atlas-watchlist-v1";
  const savedPlansKey = "airing-atlas-binge-plans-v1";
  const analyticsOptedOut = () => {
    if (window.airingAtlasAnalyticsOptedOut) return true;
    try {
      return localStorage.getItem("airingAtlasAnalyticsOptOut") === "true";
    } catch {
      return false;
    }
  };

  const sendEvent = (eventName, payload = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }

    if (window.dataLayer) window.dataLayer.push(["event", eventName, payload]);
  };

  const track = (eventName, params = {}) => {
    if (analyticsOptedOut()) return;

    const payload = {
      page_path: path(),
      content_type: contentType(),
      guide_type: guideType(),
      ...params
    };

    sendEvent(eventName, payload);
    recordAudienceSignal(eventName, payload);
  };

  window.airingAtlasTrack = track;

  const contentType = () => {
    const current = path();
    if (current === "/") return "home";
    if (current === "/binge-planner/") return "binge_planner";
    if (current === "/watch-next/") return "watch_next";
    if (current === "/finished-anime/") return "finished_anime";
    if (current.startsWith("/anime-like/")) return current === "/anime-like/" ? "anime_like_hub" : "anime_like";
    if (current.startsWith("/watch-order/")) return current === "/watch-order/" ? "watch_order_hub" : "watch_order";
    if (current.startsWith("/next-episode/")) return current === "/next-episode/" ? "next_episode_hub" : "next_episode";
    if (current.startsWith("/discover/") && current !== "/discover/") return "discover_cluster";
    if (current === "/discover/") return "discover";
    if (current === "/similar/") return "similar";
    if (current.startsWith("/anime/")) return "anime_detail";
    if (current === "/watchlist/") return "watchlist";
    if (current === "/calendar/") return "calendar";
    if (current === "/rankings/") return "rankings";
    return "standard";
  };

  const guideType = () => {
    const current = path();
    if (current.startsWith("/anime-like/") && current !== "/anime-like/") return "anime_like";
    if (current.startsWith("/watch-order/") && current !== "/watch-order/") return "watch_order";
    if (current.startsWith("/next-episode/") && current !== "/next-episode/") return "next_episode";
    if (current.startsWith("/discover/") && current !== "/discover/") return "discover_cluster";
    return "";
  };

  const audienceTypeForContent = (type = contentType()) => {
    if (["binge_planner", "watch_next", "finished_anime"].includes(type)) return "planner";
    if (type === "watchlist") return "watchlist";
    if (["discover", "discover_cluster", "anime_like", "anime_like_hub", "similar"].includes(type)) return "discovery";
    if (["next_episode", "next_episode_hub", "calendar"].includes(type)) return "schedule";
    if (["watch_order", "watch_order_hub"].includes(type)) return "guide";
    return "";
  };

  const audienceTypeForEvent = (eventName, payload = {}) => {
    const target = payload.target_path || "";
    if (eventName.includes("binge") || target.startsWith("/binge-planner")) return "planner";
    if (eventName.startsWith("watchlist") || eventName.includes("saved_plan") || target.startsWith("/watchlist")) return "watchlist";
    if (eventName.includes("discover") || eventName.includes("similar") || eventName.includes("anime_like") || target.startsWith("/anime-like")) return "discovery";
    if (eventName.includes("next_episode") || target.startsWith("/next-episode") || target.startsWith("/calendar")) return "schedule";
    if (eventName.includes("watch_order") || target.startsWith("/watch-order")) return "guide";
    return audienceTypeForContent(payload.content_type);
  };

  const localArrayCount = (key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const readAudienceProfile = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(profileKey) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const writeAudienceProfile = (profile) => {
    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
    } catch {
      /* ignore storage failures */
    }
  };

  const currentAudienceStats = () => ({
    local_watchlist_items: localArrayCount(watchlistKey),
    local_saved_plans: localArrayCount(savedPlansKey)
  });

  const setAudienceUserProperties = (profile, primaryAudience) => {
    if (typeof window.gtag !== "function") return;
    const stats = currentAudienceStats();
    window.gtag("set", "user_properties", {
      primary_audience: primaryAudience || "unknown",
      returning_local_user: String((profile.visit_count || 0) > 1),
      has_watchlist: String(stats.local_watchlist_items > 0),
      has_saved_plans: String(stats.local_saved_plans > 0)
    });
  };

  const profilePrimaryAudience = (profile) => {
    const counts = profile.audience_counts || {};
    const ranked = Object.entries(counts).sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0));
    return ranked[0]?.[0] || audienceTypeForContent();
  };

  const syncAudienceProfile = () => {
    if (analyticsOptedOut()) return;
    const now = new Date().toISOString();
    const profile = readAudienceProfile();
    profile.first_seen_at = profile.first_seen_at || now;
    profile.last_seen_at = now;
    profile.audience_counts = profile.audience_counts || {};

    let newSession = false;
    try {
      newSession = sessionStorage.getItem(sessionKey) !== "true";
      sessionStorage.setItem(sessionKey, "true");
    } catch {
      newSession = false;
    }

    if (newSession) profile.visit_count = Number(profile.visit_count || 0) + 1;
    writeAudienceProfile(profile);

    const primaryAudience = profilePrimaryAudience(profile);
    setAudienceUserProperties(profile, primaryAudience);

    if (newSession) {
      sendEvent("audience_profile_update", {
        page_path: path(),
        content_type: contentType(),
        guide_type: guideType(),
        audience_type: primaryAudience || "unknown",
        visit_count: Number(profile.visit_count || 1),
        returning_local_user: (profile.visit_count || 0) > 1,
        ...currentAudienceStats()
      });
    }
  };

  const recordAudienceSignal = (eventName, payload = {}) => {
    if (eventName === "audience_signal" || eventName === "audience_profile_update" || eventName === "page_content_view") return;
    const audienceType = audienceTypeForEvent(eventName, payload);
    if (!audienceType) return;

    const now = new Date().toISOString();
    const profile = readAudienceProfile();
    profile.first_seen_at = profile.first_seen_at || now;
    profile.last_seen_at = now;
    profile.last_audience_type = audienceType;
    profile.last_trigger_event = eventName;
    profile.audience_counts = profile.audience_counts || {};
    profile.audience_counts[audienceType] = Number(profile.audience_counts[audienceType] || 0) + 1;
    writeAudienceProfile(profile);
    setAudienceUserProperties(profile, profilePrimaryAudience(profile));

    sendEvent("audience_signal", {
      page_path: payload.page_path || path(),
      content_type: payload.content_type || contentType(),
      guide_type: payload.guide_type || guideType(),
      audience_type: audienceType,
      trigger_event: eventName,
      audience_event_count: profile.audience_counts[audienceType],
      source_section: payload.source_section || "",
      target_path: payload.target_path || "",
      anime_id: payload.anime_id || "",
      result_position: Number(payload.result_position || 0),
      ...currentAudienceStats()
    });
  };

  const sourceSection = (element) => {
    const section = element?.closest?.("[data-track-section]");
    if (section?.dataset.trackSection) return clean(section.dataset.trackSection, 60);
    if (element?.closest?.(".site-header")) return "header";
    if (element?.closest?.(".site-footer")) return "footer";
    if (element?.closest?.(".hero")) return "hero";
    if (element?.closest?.(".keyword-panel")) return "related_guides";
    if (element?.closest?.(".recommendation-grid")) return "recommendations";
    if (element?.closest?.(".anime-grid")) return "anime_grid";
    return "";
  };

  track("page_content_view", {
    content_type: contentType(),
    guide_type: guideType()
  });
  syncAudienceProfile();

  const scrollMarks = new Set();
  const trackScrollDepth = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.round((window.scrollY / scrollable) * 100);
    for (const mark of [50, 90]) {
      if (depth >= mark && !scrollMarks.has(mark)) {
        scrollMarks.add(mark);
        track(`scroll_depth_${mark}`, {
          content_type: contentType(),
          scroll_depth: mark
        });
      }
    }
  };

  window.addEventListener("scroll", trackScrollDepth, { passive: true });

  const linkTitle = (link) => clean(link.textContent || link.getAttribute("aria-label") || link.href);

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const explicit = target.closest("[data-track-event]");
    if (explicit) {
      track(explicit.dataset.trackEvent, {
        track_label: clean(explicit.dataset.trackLabel || explicit.textContent || ""),
        target_path: explicit.getAttribute("href") || "",
        anime_id: explicit.dataset.animeId || "",
        result_position: Number(explicit.dataset.resultPosition || 0),
        source_section: sourceSection(explicit)
      });
    }

    const toggle = target.closest("[data-watchlist-toggle]");
    if (toggle) {
      const action = toggle.getAttribute("aria-pressed") === "true" ? "remove" : "add";
      track("watchlist_toggle", {
        anime_id: toggle.dataset.animeId || "",
        anime_title: clean(toggle.dataset.title || ""),
        action,
        source_section: sourceSection(toggle)
      });
      if (action === "add") {
        track("watchlist_add", {
          anime_id: toggle.dataset.animeId || "",
          anime_title: clean(toggle.dataset.title || ""),
          source_section: sourceSection(toggle)
        });
      }
    }

    const remove = target.closest("[data-watchlist-remove]");
    if (remove) {
      track("watchlist_remove", {
        anime_id: remove.dataset.animeId || ""
      });
    }

    const link = target.closest("a[href]");
    if (!link) return;

    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.origin !== window.location.origin) {
      track("outbound_link_click", {
        link_domain: url.hostname,
        link_url: url.href,
        link_label: linkTitle(link),
        source_section: sourceSection(link)
      });
      return;
    }

    if (path() === "/discover/" && link.closest(".result-card")) {
      track("discover_result_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || link.closest("[data-result-position]")?.dataset.resultPosition || 0),
        source_section: sourceSection(link)
      });
    } else if (path().startsWith("/discover/") && link.closest(".guide-card, .anime-grid, .link-stack")) {
      track("discover_result_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || 0),
        source_section: sourceSection(link)
      });
    } else if (link.closest(".recommendation-card")) {
      track(path() === "/similar/" ? "similar_result_click" : "detail_similar_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname,
        anime_id: link.dataset.animeId || "",
        source_section: sourceSection(link)
      });
    } else if (url.pathname.startsWith("/watch-order/") && url.pathname !== "/watch-order/") {
      track("watch_order_click", {
        guide_title: linkTitle(link),
        target_path: url.pathname,
        source_section: sourceSection(link)
      });
    } else if (url.pathname.startsWith("/genres/")) {
      track("genre_click", {
        genre: linkTitle(link),
        target_path: url.pathname,
        source_section: sourceSection(link)
      });
    }

    if (link.dataset.resultPosition && url.pathname.startsWith("/next-episode/")) {
      track("next_episode_detail_click", {
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || 0),
        link_label: linkTitle(link),
        anime_id: link.dataset.animeId || "",
        source_section: sourceSection(link)
      });
    }
  }, true);

  document.addEventListener("change", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const status = target.closest("[data-watchlist-status], [data-watchlist-page-status]");
    if (status) {
      track("watchlist_status_change", {
        anime_id: status.dataset.animeId || "",
        status: status.value || ""
      });
      return;
    }

    if (target.closest("[data-discover-genre], [data-discover-season], [data-discover-year], [data-discover-format], [data-discover-status], [data-discover-sort]")) {
      queueDiscoverEvent();
    }
  });

  document.addEventListener("input", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    if (target.closest("[data-discover-search]")) queueDiscoverEvent();
    if (target.closest("[data-similar-search]")) queueSimilarSearchEvent();
  });

  let discoverTimer;
  const queueDiscoverEvent = () => {
    window.clearTimeout(discoverTimer);
    discoverTimer = window.setTimeout(() => {
      const query = document.querySelector("[data-discover-search]")?.value || "";
      track("discover_filter_change", {
        search_term: clean(query, 60),
        has_search: Boolean(query.trim()),
        genre: document.querySelector("[data-discover-genre]")?.value || "",
        season: document.querySelector("[data-discover-season]")?.value || "",
        year: document.querySelector("[data-discover-year]")?.value || "",
        format: document.querySelector("[data-discover-format]")?.value || "",
        status: document.querySelector("[data-discover-status]")?.value || "",
        sort: document.querySelector("[data-discover-sort]")?.value || ""
      });
    }, 900);
  };

  let similarTimer;
  const queueSimilarSearchEvent = () => {
    window.clearTimeout(similarTimer);
    similarTimer = window.setTimeout(() => {
      const query = document.querySelector("[data-similar-search]")?.value || "";
      if (!query.trim()) return;
      track("similar_search", {
        search_term: clean(query, 60)
      });
    }, 900);
  };
})();
