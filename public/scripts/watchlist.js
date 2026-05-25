(() => {
  const key = "airing-atlas-watchlist-v1";
  const statuses = ["watching", "planned", "completed", "dropped"];

  const read = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const write = (items) => {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("airing-atlas-watchlist-change"));
  };

  const getItem = (animeId) => read().find((item) => String(item.animeId) === String(animeId));

  const upsert = (entry) => {
    const items = read();
    const index = items.findIndex((item) => String(item.animeId) === String(entry.animeId));
    const next = {
      ...entry,
      updatedAt: new Date().toISOString()
    };

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

  const renderWatchlistPage = async () => {
    const mount = document.querySelector("[data-watchlist-app]");
    if (!mount) return;

    const items = read();
    const counts = statuses.reduce((acc, status) => {
      acc[status] = items.filter((item) => item.status === status).length;
      return acc;
    }, {});

    const summary = document.querySelector("[data-watchlist-summary]");
    if (summary) {
      summary.textContent = `${items.length} saved titles · ${counts.watching} watching · ${counts.planned} planned`;
    }

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

    mount.innerHTML = items
      .map((item) => `
        <article class="watchlist-row">
          <img src="${escapeHtml(item.coverImage)}" alt="" loading="lazy" />
          <div>
            <p class="eyebrow">${escapeHtml(item.status)}</p>
            <h2>${escapeHtml(item.title)}</h2>
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
      `)
      .join("");
  };

  const formatNext = (timestamp) => {
    if (!timestamp) return "No upcoming episode in the current schedule.";
    return `Next episode: ${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(timestamp * 1000))}`;
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-watchlist-toggle]");
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

    const removeButton = event.target.closest("[data-watchlist-remove]");
    if (removeButton) {
      remove(removeButton.dataset.animeId);
      renderWatchlistPage();
      syncButtons();
    }
  });

  document.addEventListener("change", (event) => {
    const select = event.target.closest("[data-watchlist-status], [data-watchlist-page-status]");
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
