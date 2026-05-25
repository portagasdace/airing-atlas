(() => {
  const mount = document.querySelector("[data-similar-results]");
  if (!mount) return;

  const search = document.querySelector("[data-similar-search]");
  const picker = document.querySelector("[data-similar-select]");
  const summary = document.querySelector("[data-similar-summary]");
  let anime = [];
  let recommendations = [];

  const load = async () => {
    const [catalogResponse, recommendationResponse] = await Promise.all([
      fetch("/data/anime-index.json"),
      fetch("/data/recommendation-index.json")
    ]);
    const catalog = await catalogResponse.json();
    const recommendationIndex = await recommendationResponse.json();
    anime = catalog.anime || [];
    recommendations = recommendationIndex.items || [];
    hydratePicker();
    const requested = new URLSearchParams(window.location.search).get("anime");
    if (requested && [...picker.options].some((option) => option.value === requested)) {
      picker.value = requested;
    }
    renderFor(picker.value || requested || String(catalog.rankings?.trending?.[0] || anime[0]?.id || ""));
  };

  const hydratePicker = () => {
    const sorted = [...anime].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 250);
    picker.innerHTML = sorted
      .map((item) => `<option value="${item.id}">${escapeHtml(titleFor(item))}</option>`)
      .join("");
  };

  const renderFor = (animeId) => {
    const base = anime.find((item) => String(item.id) === String(animeId));
    if (!base) return;

    const direct = recommendations.find((item) => String(item.animeId) === String(animeId))?.recommendations || [];
    const fallback = fallbackRecommendations(base, direct.map((item) => item.animeId));
    const items = [...direct, ...fallback].slice(0, 8);

    if (summary) {
      summary.textContent = `Showing ${items.length} matches for ${titleFor(base)}`;
    }

    mount.innerHTML = `
      <section class="selected-anime">
        <img src="${escapeHtml(base.coverImage?.large || base.coverImage?.extraLarge || "/og-default.svg")}" alt="" loading="lazy" referrerpolicy="no-referrer" />
        <div>
          <p class="eyebrow">Selected title</p>
          <h2>${escapeHtml(titleFor(base))}</h2>
          <p>${escapeHtml((base.genres || []).slice(0, 4).join(" / ") || "Genre profile pending")}</p>
        </div>
      </section>
      <div class="recommendation-grid">
        ${items.map((item) => recommendationHtml(item)).join("")}
      </div>
    `;
  };

  const fallbackRecommendations = (base, seenIds) => {
    const seen = new Set([base.id, ...seenIds]);
    return anime
      .filter((candidate) => !seen.has(candidate.id))
      .map((candidate) => ({
        animeId: candidate.id,
        title: titleFor(candidate),
        slug: candidate.slug,
        reason: reasonFor(base, candidate),
        signals: signalsFor(base, candidate),
        source: "similarity",
        coverImage: candidate.coverImage?.large || candidate.coverImage?.extraLarge || "",
        score: similarityScore(base, candidate),
        genres: candidate.genres || []
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(0, 8 - seenIds.length));
  };

  const recommendationHtml = (item) => `
    <article class="recommendation-card">
      <a class="result-poster" href="/anime/${escapeHtml(item.slug)}/">
        <img src="${escapeHtml(item.coverImage || "/og-default.svg")}" alt="" loading="lazy" referrerpolicy="no-referrer" />
      </a>
      <div>
        <p class="eyebrow">${escapeHtml(item.source === "anilist" ? "AniList signal" : "Atlas match")}</p>
        <h3><a href="/anime/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.reason || "Similar score and audience popularity")}</p>
        <div class="tag-row">${(item.signals || []).slice(0, 2).map((signal) => `<span>${escapeHtml(signal)}</span>`).join("")}</div>
      </div>
    </article>
  `;

  const filterPicker = () => {
    const query = (search.value || "").trim().toLowerCase();
    const filtered = anime
      .filter((item) => titleFor(item).toLowerCase().includes(query))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 250);
    picker.innerHTML = filtered.map((item) => `<option value="${item.id}">${escapeHtml(titleFor(item))}</option>`).join("");
    if (filtered[0]) renderFor(filtered[0].id);
  };

  const similarityScore = (base, candidate) => {
    const sharedGenres = (base.genres || []).filter((genre) => (candidate.genres || []).includes(genre)).length;
    const sharedTags = (base.tags || [])
      .map((tag) => tag.name)
      .filter((tag) => (candidate.tags || []).some((candidateTag) => candidateTag.name === tag)).length;
    const sameFormat = base.format && base.format === candidate.format ? 1 : 0;
    return sharedGenres * 5 + sharedTags * 3 + sameFormat * 2;
  };

  const signalsFor = (base, candidate) => {
    const signals = [];
    const genres = (base.genres || []).filter((genre) => (candidate.genres || []).includes(genre)).slice(0, 3);
    if (genres.length) signals.push(`Shared genres: ${genres.join(", ")}`);
    if (base.format && base.format === candidate.format) signals.push(`Same format: ${base.format}`);
    if (!signals.length) signals.push("Similar score and audience popularity");
    return signals;
  };

  const reasonFor = (base, candidate) => signalsFor(base, candidate)[0];
  const titleFor = (item) => item.title?.english || item.title?.romaji || item.title?.native || "Untitled Anime";
  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  search?.addEventListener("input", filterPicker);
  picker?.addEventListener("change", () => renderFor(picker.value));
  load().catch(() => {
    mount.innerHTML = `<section class="empty-state"><p class="eyebrow">Data unavailable</p><h2>Refresh the page and try again.</h2></section>`;
  });
})();
