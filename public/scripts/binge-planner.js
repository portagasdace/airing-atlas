(() => {
  const mount = document.querySelector("[data-binge-results]");
  if (!mount) return;

  const savedPlansKey = "airing-atlas-binge-plans-v1";
  const watchlistKey = "airing-atlas-watchlist-v1";
  const blockedGenres = new Set(["Ecchi"]);
  const blockedFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);
  const controls = {
    time: document.querySelector("[data-binge-time]"),
    mood: document.querySelector("[data-binge-mood]"),
    length: document.querySelector("[data-binge-length]"),
    finished: document.querySelector("[data-binge-finished]"),
    query: document.querySelector("[data-binge-query]")
  };
  const generateButton = document.querySelector("[data-binge-generate]");
  const copyButton = document.querySelector("[data-binge-copy]");
  const summary = document.querySelector("[data-binge-summary]");
  const message = document.querySelector("[data-binge-message]");

  const moods = {
    balanced: {
      label: "balanced anime",
      genres: [],
      tags: []
    },
    dark: {
      label: "dark fantasy",
      genres: ["Action", "Fantasy", "Supernatural", "Horror", "Drama"],
      tags: ["Dark Fantasy", "Survival", "Tragedy", "Demons", "War", "Gore", "Monster"]
    },
    action: {
      label: "action",
      genres: ["Action", "Adventure", "Fantasy"],
      tags: ["Shounen", "Super Power", "Martial Arts", "Swordplay", "Tournaments"]
    },
    emotional: {
      label: "emotional drama",
      genres: ["Drama", "Slice of Life", "Adventure"],
      tags: ["Tragedy", "Coming of Age", "Family Life", "Friendship", "Rehabilitation"]
    },
    romance: {
      label: "romance",
      genres: ["Romance", "Drama", "Comedy", "Slice of Life"],
      tags: ["School", "Love Triangle", "Coming of Age", "Family Life"]
    },
    mind: {
      label: "mind games",
      genres: ["Psychological", "Mystery", "Thriller", "Drama"],
      tags: ["Genius", "Anti-Hero", "Detective", "Crime", "Politics", "Strategy Game"]
    },
    comedy: {
      label: "comedy",
      genres: ["Comedy", "Slice of Life"],
      tags: ["Parody", "Slapstick", "Surreal Comedy", "School Club"]
    },
    adventure: {
      label: "adventure",
      genres: ["Adventure", "Action", "Fantasy", "Comedy"],
      tags: ["Travel", "Pirates", "Ninja", "Ensemble Cast", "Coming of Age"]
    }
  };

  const timeProfiles = {
    night: {
      label: "one-night route",
      count: 3,
      preferredMin: 1,
      preferredMax: 13,
      stageLabels: ["Open with impact", "Keep the pace", "Finish strong"]
    },
    weekend: {
      label: "weekend route",
      count: 4,
      preferredMin: 8,
      preferredMax: 26,
      stageLabels: ["Friday hook", "Saturday main arc", "Late-night turn", "Sunday closer"]
    },
    month: {
      label: "month project",
      count: 5,
      preferredMin: 13,
      preferredMax: 60,
      stageLabels: ["Week 1 anchor", "Second lane", "Midpoint shift", "Deep cut", "Final stretch"]
    },
    long: {
      label: "long quest",
      count: 6,
      preferredMin: 26,
      preferredMax: 1200,
      stageLabels: ["Main anchor", "World expansion", "Character detour", "High-energy run", "Big franchise leg", "Long tail"]
    }
  };

  let catalog = [];
  let currentPlan = [];
  let changeTimer;

  const load = async () => {
    const response = await fetch("/data/anime-index.json");
    const data = await response.json();
    catalog = (data.anime || []).filter(isCandidate);
    applyUrlParams();
    generatePlan({ preserveSharedIds: true, replaceUrl: !new URLSearchParams(window.location.search).get("ids") });
  };

  const applyUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    setControl("time", params.get("time"));
    setControl("mood", params.get("mood"));
    setControl("length", params.get("length"));
    setControl("finished", params.get("finished"));
    if (params.get("q") && controls.query) controls.query.value = params.get("q");
  };

  const setControl = (key, value) => {
    if (!value || !controls[key]) return;
    const options = controls[key].options ? Array.from(controls[key].options) : [];
    const option = options.find((item) => item.value === value);
    if (option) controls[key].value = value;
  };

  const currentState = () => ({
    time: controls.time?.value || "weekend",
    mood: controls.mood?.value || "balanced",
    length: controls.length?.value || "any",
    finished: controls.finished?.value !== "false",
    query: normalize(controls.query?.value || "")
  });

  const generatePlan = ({ preserveSharedIds = false, replaceUrl = true } = {}) => {
    const state = currentState();
    const sharedIds = preserveSharedIds ? idsFromUrl() : [];
    const sharedPlan = sharedIds
      .map((id) => catalog.find((anime) => Number(anime.id) === Number(id)))
      .filter(Boolean);

    currentPlan = sharedPlan.length >= 3 ? sharedPlan : rankedPlan(state);
    renderPlan(currentPlan, state, Boolean(sharedPlan.length >= 3));
    if (replaceUrl) updateShareUrl(state, currentPlan, true);
    track("binge_plan_generate", {
      mood: state.mood,
      time_budget: state.time,
      length: state.length,
      finished_only: state.finished,
      result_count: currentPlan.length
    });
  };

  const rankedPlan = (state) => {
    const profile = timeProfiles[state.time] || timeProfiles.weekend;
    const scored = catalog
      .map((anime) => scoreAnime(anime, state))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.anime.popularity || 0) - (a.anime.popularity || 0));

    const picked = [];
    const seenGenres = new Map();
    for (const item of scored) {
      if (picked.length >= profile.count) break;
      const firstGenre = item.anime.genres?.[0] || "Other";
      const genreCount = seenGenres.get(firstGenre) || 0;
      if (genreCount >= 2 && scored.length > profile.count) continue;
      picked.push(item.anime);
      seenGenres.set(firstGenre, genreCount + 1);
    }

    return picked.length >= 3
      ? picked
      : scored.slice(0, Math.max(3, profile.count)).map((item) => item.anime);
  };

  const scoreAnime = (anime, state) => {
    if (state.finished && anime.status !== "FINISHED") return { anime, score: 0 };
    if (!matchesLength(anime, state.length)) return { anime, score: 0 };

    const profile = moods[state.mood] || moods.balanced;
    const timeProfile = timeProfiles[state.time] || timeProfiles.weekend;
    let score = 20;
    const episodes = anime.episodes || 0;
    const animeGenres = anime.genres || [];
    const animeTags = (anime.tags || []).map((tag) => tag.name || "");
    const sharedGenres = animeGenres.filter((genre) => profile.genres.includes(genre));
    const sharedTags = animeTags.filter((tag) => profile.tags.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())));

    score += sharedGenres.length * 18;
    score += sharedTags.length * 13;
    if (episodes && episodes >= timeProfile.preferredMin && episodes <= timeProfile.preferredMax) score += 24;
    if (episodes && state.time === "night" && episodes <= 13) score += 14;
    if (episodes && state.time === "weekend" && episodes >= 14 && episodes <= 26) score += 14;
    if (episodes && state.time === "long" && episodes >= 50) score += 18;

    if (state.query) {
      const haystack = normalize([
        titleFor(anime),
        anime.title?.romaji,
        anime.title?.native,
        anime.description,
        anime.source,
        anime.format,
        anime.status,
        ...(anime.studios || []).map((studio) => studio.name),
        ...animeGenres,
        ...animeTags
      ].filter(Boolean).join(" "));
      const terms = state.query.split(/\s+/).filter(Boolean);
      const matched = terms.filter((term) => haystack.includes(term));
      score += matched.length * 20;
    }

    const animeScore = scoreFor(anime);
    score += animeScore >= 85 ? 16 : animeScore >= 75 ? 9 : 0;
    score += Math.log10((anime.popularity || 1)) * 5;
    if (anime.status === "FINISHED") score += 8;
    if (!profile.genres.length && !profile.tags.length) score += animeScore / 7;
    return { anime, score };
  };

  const renderPlan = (items, state, shared) => {
    const profile = timeProfiles[state.time] || timeProfiles.weekend;
    if (summary) {
      summary.textContent = `${items.length} picks · ${profile.label} · ${moods[state.mood]?.label || "balanced anime"}`;
    }

    if (!items.length) {
      mount.innerHTML = `<section class="empty-state"><p class="eyebrow">No route yet</p><h2>Try a broader length or include airing titles.</h2></section>`;
      return;
    }

    mount.innerHTML = `
      <section class="planner-share-panel">
        <div>
          <p class="eyebrow">${shared ? "Shared route" : "Fresh route"}</p>
          <h2>${escapeHtml(planTitle(state))}</h2>
          <p>${escapeHtml(planSummary(items, state))}</p>
        </div>
        <div class="planner-share-actions">
          <button class="button primary" type="button" data-binge-copy-inline>Copy share link</button>
          <button class="button" type="button" data-binge-save-inline>Save locally</button>
          <button class="button" type="button" data-binge-add-all-inline>Add all</button>
        </div>
      </section>
      <div class="planner-route-list">
        ${items.map((anime, index) => cardHtml(anime, index, state)).join("")}
      </div>
    `;

    window.dispatchEvent(new CustomEvent("airing-atlas-watchlist-change"));
  };

  const cardHtml = (anime, index, state) => {
    const title = titleFor(anime);
    const cover = anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg";
    const timeProfile = timeProfiles[state.time] || timeProfiles.weekend;
    const stage = timeProfile.stageLabels[index] || `Pick ${index + 1}`;
    const reason = reasonFor(anime, state);
    const next = anime.nextAiringEpisode?.airingAt || "";
    return `
      <article class="result-card binge-result" data-result-position="${index + 1}">
        <a class="result-poster" href="/anime/${escapeHtml(anime.slug)}/" data-track-event="binge_plan_result_click" data-track-label="${escapeHtml(title)}" data-anime-id="${anime.id}" data-result-position="${index + 1}">
          <img src="${escapeHtml(cover)}" alt="" width="104" height="146" loading="lazy" referrerpolicy="no-referrer" />
        </a>
        <div>
          <p class="eyebrow">${escapeHtml(stage)}</p>
          <h3><a href="/anime/${escapeHtml(anime.slug)}/" data-track-event="binge_plan_result_click" data-track-label="${escapeHtml(title)}" data-anime-id="${anime.id}" data-result-position="${index + 1}">${escapeHtml(title)}</a></h3>
          <p>${escapeHtml(reason)}</p>
          <div class="meta-grid">
            <span>${escapeHtml(episodeLabel(anime))}</span>
            <span>${scoreFor(anime) ? `${scoreFor(anime)}%` : "TBD"}</span>
            <span>${escapeHtml(formatLabel(anime.status || "Status TBA"))}</span>
          </div>
          <div class="tag-row">${(anime.genres || []).slice(0, 3).map((genre) => `<span>${escapeHtml(genre)}</span>`).join("")}</div>
          <div class="result-actions">
            <button class="button small" type="button" data-watchlist-toggle data-track-event="binge_plan_add_watchlist" data-track-label="${escapeHtml(title)}" data-anime-id="${anime.id}" data-title="${escapeHtml(title)}" data-cover="${escapeHtml(cover)}" data-slug="${escapeHtml(anime.slug)}" data-next-airing="${next}" data-result-position="${index + 1}">Add</button>
            <a class="button small" href="/anime/${escapeHtml(anime.slug)}/" data-track-event="binge_plan_result_click" data-track-label="${escapeHtml(title)}" data-anime-id="${anime.id}" data-result-position="${index + 1}">Details</a>
          </div>
        </div>
      </article>
    `;
  };

  const reasonFor = (anime, state) => {
    const profile = moods[state.mood] || moods.balanced;
    const sharedGenres = (anime.genres || []).filter((genre) => profile.genres.includes(genre)).slice(0, 3);
    const sharedTags = (anime.tags || [])
      .map((tag) => tag.name || "")
      .filter((tag) => profile.tags.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())))
      .slice(0, 2);
    const episodes = anime.episodes ? `${anime.episodes} episodes` : "a flexible episode count";

    if (sharedGenres.length && sharedTags.length) {
      return `Fits this ${moods[state.mood]?.label || "anime"} route through ${sharedGenres.join(", ")} and themes like ${sharedTags.join(", ")}.`;
    }
    if (sharedGenres.length) return `A strong ${episodes} pick for this route with shared genres: ${sharedGenres.join(", ")}.`;
    if (scoreFor(anime) >= 85) return `A high-score ${episodes} pick that keeps the plan reliable for sharing.`;
    return `A useful ${episodes} stop that balances score, popularity, and watchability.`;
  };

  const copyShareLink = async () => {
    if (!currentPlan.length) generatePlan({ replaceUrl: true });
    updateShareUrl(currentState(), currentPlan, true);
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied.");
    } catch {
      setMessage("Copy failed. You can copy the URL from the address bar.");
    }
    track("binge_plan_share_copy", {
      mood: currentState().mood,
      time_budget: currentState().time,
      result_count: currentPlan.length
    });
  };

  const saveCurrentPlan = () => {
    if (!currentPlan.length) generatePlan({ replaceUrl: true });
    const state = currentState();
    updateShareUrl(state, currentPlan, true);
    const plan = planSnapshot(state);
    const saved = readSavedPlans();
    writeSavedPlans([plan, ...saved.filter((item) => item.id !== plan.id)].slice(0, 12));
    setMessage("Plan saved in this browser.");
    track("binge_plan_save", {
      mood: state.mood,
      time_budget: state.time,
      result_count: currentPlan.length
    });
  };

  const addCurrentPlanToWatchlist = () => {
    if (!currentPlan.length) generatePlan({ replaceUrl: true });
    const state = currentState();
    const incoming = currentPlan.map(watchlistEntryFromAnime).filter(Boolean);
    writeWatchlist(mergeWatchlist(readWatchlist(), incoming));
    setMessage(`Added ${incoming.length} plan titles to your watchlist.`);
    track("binge_plan_add_all_watchlist", {
      mood: state.mood,
      time_budget: state.time,
      result_count: incoming.length
    });
  };

  const planSnapshot = (state) => {
    const ids = currentPlan.map((anime) => anime.id).join(",");
    return {
      id: `${state.time}-${state.mood}-${state.length}-${state.finished ? "finished" : "mixed"}-${ids}`,
      savedAt: new Date().toISOString(),
      title: planTitle(state),
      summary: planSummary(currentPlan, state),
      url: window.location.href,
      state,
      items: currentPlan.map(planItemFromAnime)
    };
  };

  const planItemFromAnime = (anime) => ({
    animeId: Number(anime.id),
    title: titleFor(anime),
    coverImage: anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg",
    slug: anime.slug || "",
    nextEpisodeAt: anime.nextAiringEpisode?.airingAt || null,
    episodes: anime.episodes || null,
    score: scoreFor(anime) || null,
    genres: (anime.genres || []).slice(0, 3)
  });

  const watchlistEntryFromAnime = (anime) => {
    if (!anime?.id) return null;
    return {
      animeId: Number(anime.id),
      title: titleFor(anime),
      coverImage: anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg",
      slug: anime.slug || "",
      status: "planned",
      nextEpisodeAt: anime.nextAiringEpisode?.airingAt || null,
      updatedAt: new Date().toISOString()
    };
  };

  const readSavedPlans = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(savedPlansKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.url && Array.isArray(item.items)) : [];
    } catch {
      return [];
    }
  };

  const writeSavedPlans = (plans) => {
    localStorage.setItem(savedPlansKey, JSON.stringify(plans));
    window.dispatchEvent(new CustomEvent("airing-atlas-binge-plans-change"));
  };

  const readWatchlist = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(watchlistKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const writeWatchlist = (items) => {
    localStorage.setItem(watchlistKey, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("airing-atlas-watchlist-change"));
  };

  const mergeWatchlist = (existing, incoming) => {
    const map = new Map(existing.filter(Boolean).map((item) => [String(item.animeId), item]));
    for (const item of incoming) {
      const previous = map.get(String(item.animeId));
      map.set(String(item.animeId), {
        ...previous,
        ...item,
        status: previous?.status || item.status,
        updatedAt: new Date().toISOString()
      });
    }
    return [...map.values()];
  };

  const updateShareUrl = (state, items, replace = true) => {
    const params = new URLSearchParams();
    params.set("time", state.time);
    params.set("mood", state.mood);
    params.set("length", state.length);
    params.set("finished", String(state.finished));
    if (controls.query?.value.trim()) params.set("q", controls.query.value.trim());
    if (items.length) params.set("ids", items.map((anime) => anime.id).join(","));
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", nextUrl);
  };

  const idsFromUrl = () => {
    const value = new URLSearchParams(window.location.search).get("ids") || "";
    return value.split(",").map((id) => Number(id.trim())).filter(Boolean).slice(0, 8);
  };

  const planTitle = (state) => {
    const profile = timeProfiles[state.time] || timeProfiles.weekend;
    const mood = moods[state.mood]?.label || "balanced anime";
    return `${formatLabel(profile.label)} for ${mood}`;
  };

  const planSummary = (items, state) => {
    const episodes = items.reduce((sum, anime) => sum + (anime.episodes || 0), 0);
    const episodeText = episodes ? `${episodes} listed episodes` : "mixed episode counts";
    const status = state.finished ? "finished anime" : "finished and airing anime";
    return `A ${items.length}-title route using ${status}, ${episodeText}, and stable ids in the share URL.`;
  };

  const matchesLength = (anime, length) => {
    const episodes = anime.episodes || 0;
    if (length === "short") return episodes > 0 && episodes <= 13;
    if (length === "medium") return episodes >= 14 && episodes <= 26;
    if (length === "long") return episodes >= 50 || anime.status === "RELEASING";
    return true;
  };

  const isCandidate = (anime) =>
    !anime.isAdult &&
    !blockedFormats.has(String(anime.format || "").toUpperCase()) &&
    !(anime.genres || []).some((genre) => blockedGenres.has(genre));

  const titleFor = (anime) => anime.title?.english || anime.title?.romaji || anime.title?.native || "Untitled Anime";
  const scoreFor = (anime) => anime.averageScore || anime.meanScore || 0;
  const episodeLabel = (anime) => anime.episodes ? `${anime.episodes} eps` : anime.status === "RELEASING" ? "Ongoing" : "Episodes TBA";
  const formatLabel = (value) => String(value || "").replaceAll("_", " ").replaceAll("-", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/\b(anime|manga|shows?|series|tv|watch|next|best|like|similar|recommendations?|binge|plan)\b/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const setMessage = (value) => {
    if (message) message.textContent = value;
  };
  const track = (eventName, params = {}) => {
    if (typeof window.airingAtlasTrack === "function") {
      window.airingAtlasTrack(eventName, params);
    }
  };
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  generateButton?.addEventListener("click", () => generatePlan({ replaceUrl: false }));
  copyButton?.addEventListener("click", copyShareLink);
  Object.values(controls).forEach((control) => {
    control?.addEventListener("change", () => generatePlan({ replaceUrl: true }));
    control?.addEventListener("input", () => {
      window.clearTimeout(changeTimer);
      changeTimer = window.setTimeout(() => generatePlan({ replaceUrl: true }), 500);
    });
  });
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest("[data-binge-copy-inline]")) copyShareLink();
    if (target.closest("[data-binge-save], [data-binge-save-inline]")) saveCurrentPlan();
    if (target.closest("[data-binge-add-all], [data-binge-add-all-inline]")) addCurrentPlanToWatchlist();
  });

  document.querySelectorAll("[data-binge-preset]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const params = new URLSearchParams(new URL(link.href).search);
      setControl("time", params.get("time"));
      setControl("mood", params.get("mood"));
      setControl("length", params.get("length"));
      setControl("finished", params.get("finished"));
      if (controls.query) controls.query.value = params.get("q") || "";
      generatePlan({ replaceUrl: false });
    });
  });

  load().catch(() => {
    mount.innerHTML = `<section class="empty-state"><p class="eyebrow">Data unavailable</p><h2>Refresh the page and try again.</h2></section>`;
    if (summary) summary.textContent = "Planner data failed to load.";
  });
})();
