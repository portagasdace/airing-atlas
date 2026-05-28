(() => {
  const mount = document.querySelector("[data-discover-results]");
  if (!mount) return;
  const excludedPublicGenres = new Set(["Ecchi"]);

  const state = {
    anime: [],
    controls: {
      query: document.querySelector("[data-discover-search]"),
      genre: document.querySelector("[data-discover-genre]"),
      season: document.querySelector("[data-discover-season]"),
      year: document.querySelector("[data-discover-year]"),
      format: document.querySelector("[data-discover-format]"),
      status: document.querySelector("[data-discover-status]"),
      sort: document.querySelector("[data-discover-sort]")
    },
    summary: document.querySelector("[data-discover-summary]")
  };
  let lastZeroState = "";

  const load = async () => {
    const response = await fetch("/data/anime-index.json");
    const catalog = await response.json();
    state.anime = catalog.anime || [];
    hydrateOptions();
    applyUrlParams();
    render();
  };

  const applyUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const mapping = {
      query: params.get("q"),
      genre: params.get("genre"),
      season: params.get("season"),
      year: params.get("year"),
      format: params.get("format"),
      status: params.get("status"),
      sort: params.get("sort")
    };
    for (const [key, value] of Object.entries(mapping)) {
      const control = state.controls[key];
      if (!value || !control) continue;
      if (control.tagName === "SELECT") {
        const option = [...control.options].find((item) => item.value === value);
        if (option) control.value = value;
      } else {
        control.value = value;
      }
    }
  };

  const hydrateOptions = () => {
    const genres = unique(state.anime.flatMap((anime) => anime.genres || []).filter((genre) => !excludedPublicGenres.has(genre))).sort();
    const years = unique(state.anime.map((anime) => anime.seasonYear).filter(Boolean)).sort((a, b) => b - a);
    const formats = unique(state.anime.map((anime) => anime.format).filter(Boolean)).sort();
    const statuses = unique(state.anime.map((anime) => anime.status).filter(Boolean)).sort();

    fillSelect(state.controls.genre, genres, "All genres");
    fillSelect(state.controls.year, years, "All years");
    fillSelect(state.controls.format, formats, "All formats");
    fillSelect(state.controls.status, statuses, "All statuses");
  };

  const fillSelect = (select, values, label) => {
    if (!select) return;
    const current = select.value;
    select.innerHTML = `<option value="">${escapeHtml(label)}</option>${values
      .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(formatLabel(value))}</option>`)
      .join("")}`;
    select.value = current;
  };

  const render = () => {
    const filtered = state.anime.filter(matchesFilters).sort(sortAnime);
    const results = filtered.slice(0, 48);
    if (state.summary) {
      state.summary.textContent = `${filtered.length} titles found · showing ${results.length}`;
    }

    mount.innerHTML = results.length
      ? results.map((anime, index) => cardHtml(anime, index)).join("")
      : `<section class="empty-state"><p class="eyebrow">No match</p><h2>Try a broader genre, status, or title search.</h2></section>`;

    if (!filtered.length) {
      const zeroState = JSON.stringify(currentFilters());
      if (zeroState !== lastZeroState && typeof window.airingAtlasTrack === "function") {
        window.airingAtlasTrack("discover_zero_results", currentFilters());
      }
      lastZeroState = zeroState;
    } else {
      lastZeroState = "";
    }
  };

  const matchesFilters = (anime) => {
    const query = normalizeSearchQuery(state.controls.query?.value || "");
    const terms = query.split(/\s+/).filter(Boolean);
    const genre = state.controls.genre?.value || "";
    const season = state.controls.season?.value || "";
    const year = state.controls.year?.value || "";
    const format = state.controls.format?.value || "";
    const status = state.controls.status?.value || "";

    const haystack = [
      anime.title?.english,
      anime.title?.romaji,
      anime.title?.native,
      anime.format,
      anime.status,
      anime.source,
      anime.season,
      anime.seasonYear,
      ...(anime.studios || []).map((studio) => studio.name),
      ...(anime.genres || []),
      ...(anime.tags || []).map((tag) => tag.name)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (!terms.length || terms.every((term) => haystack.includes(term)))
      && (!genre || (anime.genres || []).includes(genre))
      && (!season || anime.season === season)
      && (!year || String(anime.seasonYear) === year)
      && (!format || anime.format === format)
      && (!status || anime.status === status);
  };

  const sortAnime = (a, b) => {
    const sort = state.controls.sort?.value || "popularity";
    if (sort === "score") return scoreFor(b) - scoreFor(a);
    if (sort === "airing") return airingValue(a) - airingValue(b);
    if (sort === "title") return titleFor(a).localeCompare(titleFor(b));
    return (b.popularity || 0) - (a.popularity || 0);
  };

  const cardHtml = (anime, index) => {
    const title = titleFor(anime);
    const cover = anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg";
    return `
      <article class="result-card">
        <a class="result-poster" href="/anime/${escapeHtml(anime.slug)}/" aria-label="Open ${escapeHtml(title)}" data-result-position="${index + 1}">
          <img src="${escapeHtml(cover)}" alt="" width="104" height="146" loading="lazy" referrerpolicy="no-referrer" />
        </a>
        <div>
          <p class="eyebrow">${escapeHtml(seasonLabel(anime))}</p>
          <h3><a href="/anime/${escapeHtml(anime.slug)}/" data-result-position="${index + 1}">${escapeHtml(title)}</a></h3>
          <p>${escapeHtml(cleanText(anime.description || "", 150))}</p>
          <div class="meta-grid">
            <span>${scoreFor(anime) ? `${scoreFor(anime)}%` : "TBD"}</span>
            <span>${escapeHtml(formatLabel(anime.format || "Format TBA"))}</span>
            <span>${escapeHtml(formatLabel(anime.status || "Status TBA"))}</span>
          </div>
          <div class="tag-row">${(anime.genres || []).slice(0, 3).map((genre) => `<span>${escapeHtml(genre)}</span>`).join("")}</div>
        </div>
      </article>
    `;
  };

  const titleFor = (anime) => anime.title?.english || anime.title?.romaji || anime.title?.native || "Untitled Anime";
  const scoreFor = (anime) => anime.averageScore || anime.meanScore || 0;
  const airingValue = (anime) => anime.nextAiringEpisode?.airingAt || Number.MAX_SAFE_INTEGER;
  const currentFilters = () => ({
    search_term: cleanForEvent(state.controls.query?.value || ""),
    genre: state.controls.genre?.value || "",
    season: state.controls.season?.value || "",
    year: state.controls.year?.value || "",
    format: state.controls.format?.value || "",
    status: state.controls.status?.value || "",
    sort: state.controls.sort?.value || ""
  });
  const seasonLabel = (anime) => anime.season && anime.seasonYear ? `${formatLabel(anime.season)} ${anime.seasonYear}` : "Season TBA";
  const formatLabel = (value) => String(value || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  const cleanText = (value, max) => {
    const cleaned = String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    return cleaned.length > max ? `${cleaned.slice(0, max - 1).trim()}...` : cleaned;
  };
  const cleanForEvent = (value = "") => String(value).replace(/\s+/g, " ").trim().slice(0, 80);
  const normalizeSearchQuery = (value) =>
    String(value)
      .toLowerCase()
      .replace(/\b(anime|manga|shows?|series|tv)\b/g, " ")
      .replace(/\b(like|similar to|similar|recommendations?|recommended|watch order|release schedule|next episode|best|top)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const unique = (items) => [...new Set(items)];
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  Object.values(state.controls).forEach((control) => {
    control?.addEventListener("input", render);
    control?.addEventListener("change", render);
  });

  load().catch(() => {
    mount.innerHTML = `<section class="empty-state"><p class="eyebrow">Data unavailable</p><h2>Refresh the page and try again.</h2></section>`;
  });
})();
