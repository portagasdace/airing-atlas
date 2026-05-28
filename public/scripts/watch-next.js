(() => {
  const mount = document.querySelector("[data-watch-next-results]");
  if (!mount) return;

  const blockedGenres = new Set(["Ecchi"]);
  const blockedFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);
  const controls = {
    mood: document.querySelector("[data-watch-next-mood]"),
    length: document.querySelector("[data-watch-next-length]"),
    status: document.querySelector("[data-watch-next-status]"),
    query: document.querySelector("[data-watch-next-query]"),
    priority: document.querySelector("[data-watch-next-priority]")
  };
  const summary = document.querySelector("[data-watch-next-summary]");

  const moods = {
    balanced: {
      label: "balanced discovery",
      genres: [],
      tags: []
    },
    action: {
      label: "action and battles",
      genres: ["Action", "Adventure"],
      tags: ["Shounen", "Super Power", "Martial Arts", "Battle Royale", "Swordplay"]
    },
    dark: {
      label: "dark fantasy",
      genres: ["Action", "Fantasy", "Horror", "Supernatural", "Drama"],
      tags: ["Dark Fantasy", "Survival", "Tragedy", "Demons", "War", "Gore", "Monster"]
    },
    funny: {
      label: "comedy",
      genres: ["Comedy", "Slice of Life"],
      tags: ["Parody", "Surreal Comedy", "Slapstick", "School Club"]
    },
    emotional: {
      label: "emotional drama",
      genres: ["Drama", "Slice of Life"],
      tags: ["Tragedy", "Coming of Age", "Family Life", "Rehabilitation", "Friendship"]
    },
    romance: {
      label: "romance drama",
      genres: ["Romance", "Drama", "Comedy", "Slice of Life"],
      tags: ["School", "Love Triangle", "Heterosexual", "Coming of Age"]
    },
    mind: {
      label: "mind games",
      genres: ["Psychological", "Mystery", "Thriller", "Drama"],
      tags: ["Genius", "Anti-Hero", "Detective", "Crime", "Politics", "Strategy Game"]
    },
    adventure: {
      label: "long adventure",
      genres: ["Adventure", "Action", "Fantasy", "Comedy"],
      tags: ["Travel", "Pirates", "Ninja", "Ensemble Cast", "Coming of Age"]
    },
    cozy: {
      label: "cozy slice of life",
      genres: ["Slice of Life", "Comedy", "Romance"],
      tags: ["Iyashikei", "Cute Girls Doing Cute Things", "Food", "School", "Family Life"]
    }
  };

  let catalog = [];
  let lastEventState = "";

  const load = async () => {
    const response = await fetch("/data/anime-index.json");
    const data = await response.json();
    catalog = (data.anime || []).filter(isCandidate);
    applyUrlParams();
    render();
  };

  const applyUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    setControl("mood", params.get("mood"));
    setControl("length", params.get("length"));
    setControl("status", params.get("status"));
    setControl("priority", params.get("priority"));
    if (params.get("q") && controls.query) controls.query.value = params.get("q");
  };

  const setControl = (key, value) => {
    if (!value || !controls[key]) return;
    const options = controls[key].options ? Array.from(controls[key].options) : [];
    const option = options.find((item) => item.value === value);
    if (option) controls[key].value = value;
  };

  const render = () => {
    const state = currentState();
    const scored = catalog
      .map((anime) => scoreAnime(anime, state))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || (b.anime.popularity || 0) - (a.anime.popularity || 0));
    const results = scored.slice(0, 12);

    if (summary) {
      summary.textContent = `${scored.length} matches found · showing ${results.length} recommendations for ${moods[state.mood]?.label || "balanced discovery"}.`;
    }

    mount.innerHTML = results.length
      ? results.map((item, index) => cardHtml(item, index)).join("")
      : `<section class="empty-state"><p class="eyebrow">No recommendation</p><h2>Try any length, either status, or a broader mood.</h2></section>`;

    const eventState = JSON.stringify(state);
    if (eventState !== lastEventState && typeof window.airingAtlasTrack === "function") {
      window.airingAtlasTrack("watch_next_filter_change", {
        mood: state.mood,
        length: state.length,
        status: state.status,
        priority: state.priority,
        has_reference: Boolean(state.query)
      });
    }
    lastEventState = eventState;
  };

  const currentState = () => ({
    mood: controls.mood?.value || "balanced",
    length: controls.length?.value || "any",
    status: controls.status?.value || "either",
    query: normalize(controls.query?.value || ""),
    priority: controls.priority?.value || "balanced"
  });

  const isCandidate = (anime) =>
    !anime.isAdult &&
    !blockedFormats.has(String(anime.format || "").toUpperCase()) &&
    !(anime.genres || []).some((genre) => blockedGenres.has(genre));

  const scoreAnime = (anime, state) => {
    if (!matchesLength(anime, state.length) || !matchesStatus(anime, state.status)) {
      return { anime, score: 0, reasons: [] };
    }

    const profile = moods[state.mood] || moods.balanced;
    const reasons = [];
    let score = 18;
    const animeGenres = anime.genres || [];
    const animeTags = (anime.tags || []).map((tag) => tag.name || "");
    const sharedGenres = animeGenres.filter((genre) => profile.genres.includes(genre));
    const sharedTags = animeTags.filter((tag) => profile.tags.some((keyword) => tag.toLowerCase().includes(keyword.toLowerCase())));

    score += sharedGenres.length * 16;
    score += sharedTags.length * 12;
    if (sharedGenres.length) reasons.push(`Mood match: ${sharedGenres.slice(0, 3).join(", ")}`);
    if (sharedTags.length) reasons.push(`Theme match: ${sharedTags.slice(0, 2).join(", ")}`);

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
      score += matched.length * 18;
      if (matched.length) reasons.push(`Reference match: ${matched.slice(0, 3).join(", ")}`);
    }

    const animeScore = anime.averageScore || anime.meanScore || 0;
    if (animeScore >= 85) {
      score += 14;
      reasons.push(`High audience score: ${animeScore}%`);
    } else if (animeScore >= 75) {
      score += 8;
    }

    if ((anime.popularity || 0) > 100000) score += 10;
    if (anime.nextAiringEpisode?.airingAt && anime.nextAiringEpisode.airingAt * 1000 > Date.now()) {
      score += state.priority === "fresh" ? 20 : 4;
      reasons.push("Has an upcoming episode");
    }
    if (state.priority === "score") score += animeScore / 5;
    if (state.priority === "popular") score += Math.log10((anime.popularity || 1)) * 5;

    if (!profile.genres.length && !profile.tags.length) {
      reasons.push("Balanced by score, popularity, and catalog fit");
    }
    if (!reasons.length) reasons.push("A solid adjacent pick from the current catalog");

    return { anime, score, reasons: unique(reasons).slice(0, 3) };
  };

  const matchesLength = (anime, length) => {
    const episodes = anime.episodes || 0;
    if (length === "short") return episodes > 0 && episodes <= 13;
    if (length === "weekend") return episodes >= 14 && episodes <= 26;
    if (length === "long") return episodes >= 50 || anime.status === "RELEASING";
    return true;
  };

  const matchesStatus = (anime, status) => {
    if (status === "finished") return anime.status === "FINISHED";
    if (status === "airing") return anime.status === "RELEASING";
    return true;
  };

  const cardHtml = ({ anime, score, reasons }, index) => {
    const title = titleFor(anime);
    const cover = anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg";
    const next = anime.nextAiringEpisode?.airingAt || "";
    return `
      <article class="result-card decision-result">
        <a class="result-poster" href="/anime/${escapeHtml(anime.slug)}/" data-track-event="watch_next_result_click" data-track-label="${escapeHtml(title)}" data-result-position="${index + 1}">
          <img src="${escapeHtml(cover)}" alt="" width="104" height="146" loading="lazy" referrerpolicy="no-referrer" />
        </a>
        <div>
          <p class="eyebrow">${escapeHtml(seasonLabel(anime))}</p>
          <h3><a href="/anime/${escapeHtml(anime.slug)}/" data-track-event="watch_next_result_click" data-track-label="${escapeHtml(title)}" data-result-position="${index + 1}">${escapeHtml(title)}</a></h3>
          <p>${escapeHtml(cleanText(anime.description || "", 145))}</p>
          <div class="meta-grid">
            <span>${Math.round(score)} match</span>
            <span>${scoreFor(anime) ? `${scoreFor(anime)}%` : "TBD"}</span>
            <span>${escapeHtml(formatLabel(anime.status || "Status TBA"))}</span>
          </div>
          <div class="tag-row">${reasons.map((reason) => `<span>${escapeHtml(reason)}</span>`).join("")}</div>
          <div class="result-actions">
            <button class="button small" type="button" data-watchlist-toggle data-anime-id="${anime.id}" data-title="${escapeHtml(title)}" data-cover="${escapeHtml(cover)}" data-slug="${escapeHtml(anime.slug)}" data-next-airing="${next}">Add</button>
            <a class="button small" href="/anime/${escapeHtml(anime.slug)}/" data-track-event="watch_next_detail_click" data-track-label="${escapeHtml(title)}" data-result-position="${index + 1}">Details</a>
          </div>
        </div>
      </article>
    `;
  };

  const titleFor = (anime) => anime.title?.english || anime.title?.romaji || anime.title?.native || "Untitled Anime";
  const scoreFor = (anime) => anime.averageScore || anime.meanScore || 0;
  const seasonLabel = (anime) => anime.season && anime.seasonYear ? `${formatLabel(anime.season)} ${anime.seasonYear}` : "Season TBA";
  const formatLabel = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  const normalize = (value) =>
    String(value)
      .toLowerCase()
      .replace(/\b(anime|manga|shows?|series|tv|watch|next|best|like|similar|recommendations?)\b/g, " ")
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const cleanText = (value, max) => {
    const cleaned = String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    return cleaned.length > max ? `${cleaned.slice(0, max - 1).trim()}...` : cleaned;
  };
  const unique = (items) => [...new Set(items)];
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  Object.values(controls).forEach((control) => {
    control?.addEventListener("input", render);
    control?.addEventListener("change", render);
  });

  document.querySelectorAll("[data-watch-next-preset]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const params = new URLSearchParams(new URL(link.href).search);
      setControl("mood", params.get("mood"));
      setControl("length", params.get("length"));
      setControl("status", params.get("status"));
      setControl("priority", params.get("priority"));
      render();
    });
  });

  load().catch(() => {
    mount.innerHTML = `<section class="empty-state"><p class="eyebrow">Data unavailable</p><h2>Refresh the page and try again.</h2></section>`;
    if (summary) summary.textContent = "Recommendation data failed to load.";
  });
})();
