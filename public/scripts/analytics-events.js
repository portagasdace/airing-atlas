(() => {
  const clean = (value = "", max = 80) => String(value).replace(/\s+/g, " ").trim().slice(0, max);
  const path = () => window.location.pathname;

  const track = (eventName, params = {}) => {
    const payload = {
      page_path: path(),
      ...params
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["event", eventName, payload]);
  };

  window.airingAtlasTrack = track;

  const contentType = () => {
    const current = path();
    if (current === "/") return "home";
    if (current.startsWith("/anime-like/")) return current === "/anime-like/" ? "anime_like_hub" : "anime_like";
    if (current.startsWith("/watch-order/")) return current === "/watch-order/" ? "watch_order_hub" : "watch_order";
    if (current.startsWith("/next-episode/")) return current === "/next-episode/" ? "next_episode_hub" : "next_episode";
    if (current.startsWith("/discover/") && current !== "/discover/") return "discover_cluster";
    if (current === "/discover/") return "discover";
    if (current.startsWith("/anime/")) return "anime_detail";
    if (current === "/watchlist/") return "watchlist";
    if (current === "/calendar/") return "calendar";
    if (current === "/rankings/") return "rankings";
    return "standard";
  };

  track("page_content_view", {
    content_type: contentType()
  });

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
        target_path: explicit.getAttribute("href") || ""
      });
    }

    const toggle = target.closest("[data-watchlist-toggle]");
    if (toggle) {
      const action = toggle.getAttribute("aria-pressed") === "true" ? "remove" : "add";
      track("watchlist_toggle", {
        anime_id: toggle.dataset.animeId || "",
        anime_title: clean(toggle.dataset.title || ""),
        action
      });
      if (action === "add") {
        track("watchlist_add", {
          anime_id: toggle.dataset.animeId || "",
          anime_title: clean(toggle.dataset.title || "")
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
        link_label: linkTitle(link)
      });
      return;
    }

    if (path() === "/discover/" && link.closest(".result-card")) {
      track("discover_result_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || link.closest("[data-result-position]")?.dataset.resultPosition || 0)
      });
    } else if (path().startsWith("/discover/") && link.closest(".guide-card, .anime-grid, .link-stack")) {
      track("discover_result_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || 0),
        content_type: contentType()
      });
    } else if (link.closest(".recommendation-card")) {
      track(path() === "/similar/" ? "similar_result_click" : "detail_similar_click", {
        anime_title: linkTitle(link),
        target_path: url.pathname
      });
    } else if (url.pathname.startsWith("/watch-order/") && url.pathname !== "/watch-order/") {
      track("watch_order_click", {
        guide_title: linkTitle(link),
        target_path: url.pathname
      });
    } else if (url.pathname.startsWith("/genres/")) {
      track("genre_click", {
        genre: linkTitle(link),
        target_path: url.pathname
      });
    }

    if (link.dataset.resultPosition && url.pathname.startsWith("/next-episode/")) {
      track("next_episode_detail_click", {
        target_path: url.pathname,
        result_position: Number(link.dataset.resultPosition || 0),
        link_label: linkTitle(link)
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
