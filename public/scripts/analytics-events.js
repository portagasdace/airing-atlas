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
        target_path: url.pathname
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
