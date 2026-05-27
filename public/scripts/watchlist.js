(() => {
  const key = "airing-atlas-watchlist-v1";
  const statuses = ["watching", "planned", "completed", "dropped"];
  const statusRank = new Map(statuses.map((status, index) => [status, index]));

  const read = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.map(normalizeItem).filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(key, JSON.stringify(items.map(normalizeItem).filter(Boolean)));
    window.dispatchEvent(new CustomEvent("airing-atlas-watchlist-change"));
  };

  const getItem = (animeId) => read().find((item) => String(item.animeId) === String(animeId));

  const upsert = (entry) => {
    const items = read();
    const index = items.findIndex((item) => String(item.animeId) === String(entry.animeId));
    const next = normalizeItem({
      ...entry,
      updatedAt: new Date().toISOString()
    });
    if (!next) return;

    if (index >= 0) {
      items[index] = { ...items[index], ...next };
    } else {
      items.unshift(next);
    }
    write(items);
  };

  const remove = (animeId) => write(read().filter((item) => String(item.animeId) !== String(animeId)));

  const entryFromElement = (element, status = "planned") => ({
    animeId: Number(element.dataset.animeId),
    title: element.dataset.title || "Untitled Anime",
    coverImage: element.dataset.cover || "",
    slug: element.dataset.slug || "",
    status,
    nextEpisodeAt: element.dataset.nextAiring ? Number(element.dataset.nextAiring) : null
  });

  const syncButtons = () => {
    document.querySelectorAll("[data-watchlist-toggle]").forEach((button) => {
      const saved = Boolean(getItem(button.dataset.animeId));
      button.setAttribute("aria-pressed", saved ? "true" : "false");
      button.textContent = saved ? "Saved" : "Add";
    });

    document.querySelectorAll("[data-watchlist-status]").forEach((select) => {
      const saved = getItem(select.dataset.animeId);
      if (saved) select.value = saved.status;
    });
  };

  const renderWatchlistPage = () => {
    const mount = document.querySelector("[data-watchlist-app]");
    const dashboard = document.querySelector("[data-watchlist-dashboard]");
    if (!mount && !dashboard) return;

    const items = sortedItems(read());
    const counts = statuses.reduce((acc, status) => {
      acc[status] = items.filter((item) => item.status === status).length;
      return acc;
    }, {});
    const today = items.filter(airsToday);
    const thisWeek = items.filter(airsThisWeek);
    const nextUp = items.filter((item) => isFuture(item.nextEpisodeAt)).sort((a, b) => a.nextEpisodeAt - b.nextEpisodeAt);

    const summary = document.querySelector("[data-watchlist-summary]");
    if (summary) {
      summary.textContent = `${items.length} saved titles · ${counts.watching} watching · ${counts.planned} planned · ${today.length} airing today`;
    }

    if (dashboard) {
      dashboard.innerHTML = items.length ? dashboardHtml({ counts, today, thisWeek, nextUp }) : "";
    }

    if (!mount) return;

    if (!items.length) {
      mount.innerHTML = `
        <section class="empty-state">
          <p class="eyebrow">No titles saved yet</p>
          <h2>Build your queue from the calendar or rankings.</h2>
          <a class="button primary" href="/calendar/">Open the airing calendar</a>
        </section>
      `;
      return;
    }

    mount.innerHTML = `
      <div class="watchlist-section-header">
        <div>
          <p class="eyebrow">Saved titles</p>
          <h2>Your local queue</h2>
        </div>
        <span>${items.length} titles</span>
      </div>
      ${items.map(rowHtml).join("")}
    `;
  };

  const dashboardHtml = ({ counts, today, thisWeek, nextUp }) => `
    <section class="watchlist-dashboard" aria-label="Watchlist status">
      <article><span>Watching</span><strong>${counts.watching}</strong></article>
      <article><span>Planned</span><strong>${counts.planned}</strong></article>
      <article><span>Airing today</span><strong>${today.length}</strong></article>
      <article><span>This week</span><strong>${thisWeek.length}</strong></article>
    </section>
    <section class="watchlist-next-up">
      <div>
        <p class="eyebrow">Next up</p>
        <h2>${nextUp.length ? "Upcoming from your list" : "No upcoming episodes saved"}</h2>
      </div>
      ${nextUp.length ? `<div class="link-stack">${nextUp.slice(0, 5).map(nextUpHtml).join("")}</div>` : `<p>Add currently airing titles from the calendar to see your next episodes here.</p>`}
    </section>
  `;

  const nextUpHtml = (item, index) => {
    const href = item.slug ? `/anime/${escapeHtml(item.slug)}/` : "#";
    return `
      <a href="${href}" data-watchlist-next-up data-anime-id="${item.animeId}" data-result-position="${index + 1}">
        ${escapeHtml(item.title)}
        <span>${escapeHtml(formatNext(item.nextEpisodeAt).replace(/^Next episode: /, ""))}</span>
      </a>
    `;
  };

  const rowHtml = (item) => {
    const titleHtml = item.slug
      ? `<a href="/anime/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a>`
      : escapeHtml(item.title);
    return `
      <article class="watchlist-row">
        <img src="${escapeHtml(item.coverImage || "/og-default.svg")}" alt="" loading="lazy" />
        <div>
          <p class="eyebrow">${escapeHtml(item.status)}</p>
          <h2>${titleHtml}</h2>
          <p>${formatNext(item.nextEpisodeAt)}</p>
        </div>
        <label>
          <span class="sr-only">Status for ${escapeHtml(item.title)}</span>
          <select data-watchlist-page-status data-anime-id="${item.animeId}">
            ${statuses.map((status) => `<option value="${status}" ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <button class="button ghost" data-watchlist-remove data-anime-id="${item.animeId}">Remove</button>
      </article>
    `;
  };

  const exportWatchlist = () => {
    const items = read();
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), key, items }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `airing-atlas-watchlist-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${items.length} saved titles.`);
    track("watchlist_export", { item_count: items.length });
  };

  const importWatchlist = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(incoming)) throw new Error("Missing watchlist items");
      const merged = mergeItems(read(), incoming.map(normalizeItem).filter(Boolean));
      write(merged);
      setMessage(`Imported ${incoming.length} titles. Your browser now has ${merged.length} saved titles.`);
      track("watchlist_import", { item_count: incoming.length, merged_count: merged.length });
      renderWatchlistPage();
      syncButtons();
    } catch {
      setMessage("Import failed. Use a JSON file exported from Airing Atlas.");
    }
  };

  const mergeItems = (existing, incoming) => {
    const map = new Map(existing.map((item) => [String(item.animeId), item]));
    for (const item of incoming) {
      map.set(String(item.animeId), {
        ...map.get(String(item.animeId)),
        ...item,
        updatedAt: new Date().toISOString()
      });
    }
    return sortedItems([...map.values()]);
  };

  const normalizeItem = (item) => {
    if (!item?.animeId || !item.title) return null;
    return {
      animeId: Number(item.animeId),
      title: String(item.title),
      coverImage: String(item.coverImage || ""),
      slug: String(item.slug || ""),
      status: statuses.includes(item.status) ? item.status : "planned",
      nextEpisodeAt: Number(item.nextEpisodeAt) > 0 ? Number(item.nextEpisodeAt) : null,
      updatedAt: item.updatedAt || new Date().toISOString()
    };
  };

  const sortedItems = (items) =>
    [...items].sort((a, b) => {
      const statusDiff = (statusRank.get(a.status) ?? 99) - (statusRank.get(b.status) ?? 99);
      if (statusDiff) return statusDiff;
      const aTime = a.nextEpisodeAt || Number.MAX_SAFE_INTEGER;
      const bTime = b.nextEpisodeAt || Number.MAX_SAFE_INTEGER;
      return aTime - bTime || a.title.localeCompare(b.title);
    });

  const isFuture = (timestamp) => Boolean(timestamp && timestamp * 1000 > Date.now());

  const airsToday = (item) => {
    if (!isFuture(item.nextEpisodeAt)) return false;
    const now = new Date();
    const date = new Date(item.nextEpisodeAt * 1000);
    return now.toDateString() === date.toDateString();
  };

  const airsThisWeek = (item) => isFuture(item.nextEpisodeAt) && item.nextEpisodeAt * 1000 - Date.now() <= 7 * 24 * 60 * 60 * 1000;

  const formatNext = (timestamp) => {
    if (!timestamp) return "No upcoming episode in the current schedule.";
    if (timestamp * 1000 <= Date.now()) return "Episode already aired; refresh after the next sync.";
    return `Next episode: ${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp * 1000))}`;
  };

  const setMessage = (message) => {
    const node = document.querySelector("[data-watchlist-message]");
    if (node) node.textContent = message;
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

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const toggle = target.closest("[data-watchlist-toggle]");
    if (toggle) {
      const animeId = toggle.dataset.animeId;
      if (getItem(animeId)) {
        remove(animeId);
      } else {
        upsert(entryFromElement(toggle));
      }
      syncButtons();
      renderWatchlistPage();
    }

    const removeButton = target.closest("[data-watchlist-remove]");
    if (removeButton) {
      remove(removeButton.dataset.animeId);
      renderWatchlistPage();
      syncButtons();
    }

    if (target.closest("[data-watchlist-export]")) {
      exportWatchlist();
    }

    const nextUp = target.closest("[data-watchlist-next-up]");
    if (nextUp) {
      track("watchlist_next_up_click", {
        anime_id: nextUp.dataset.animeId || "",
        result_position: Number(nextUp.dataset.resultPosition || 0)
      });
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const importInput = target.closest("[data-watchlist-import]");
    if (importInput) {
      importWatchlist(importInput.files?.[0]);
      importInput.value = "";
      return;
    }

    const select = target.closest("[data-watchlist-status], [data-watchlist-page-status]");
    if (!select) return;
    const existing = getItem(select.dataset.animeId);
    if (existing) {
      upsert({ ...existing, status: select.value });
    } else {
      upsert(entryFromElement(select, select.value));
    }
    syncButtons();
    renderWatchlistPage();
  });

  window.addEventListener("airing-atlas-watchlist-change", syncButtons);
  syncButtons();
  renderWatchlistPage();
})();
