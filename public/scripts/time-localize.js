(() => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  document.querySelectorAll("[data-airing-at]").forEach((node) => {
    const timestamp = Number(node.getAttribute("data-airing-at"));
    if (!timestamp) return;
    const date = new Date(timestamp * 1000);
    node.textContent = formatter.format(date);
    node.setAttribute("datetime", date.toISOString());
  });

  const now = Date.now();
  document.querySelectorAll("[data-airing-at-card]").forEach((node) => {
    const timestamp = Number(node.getAttribute("data-airing-at-card"));
    if (!timestamp || timestamp * 1000 > now) return;
    node.hidden = true;
    if (typeof window.airingAtlasTrack === "function" && node.matches("[data-next-episode-card]")) {
      window.airingAtlasTrack("next_episode_expired_view", {
        expired_at: new Date(timestamp * 1000).toISOString()
      });
    }
  });

  document.querySelectorAll("[data-airing-at-expiry]").forEach((node) => {
    const timestamp = Number(node.getAttribute("data-airing-at-expiry"));
    if (!timestamp || timestamp * 1000 > now) return;
    node.hidden = false;
    if (typeof window.airingAtlasTrack === "function") {
      window.airingAtlasTrack("next_episode_expired_view", {
        expired_at: new Date(timestamp * 1000).toISOString()
      });
    }
  });

  document.querySelectorAll("[data-generated-at]").forEach((node) => {
    const value = node.getAttribute("data-generated-at");
    if (!value) return;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    node.textContent = formatter.format(date);
    node.setAttribute("datetime", date.toISOString());
  });

  document.querySelectorAll("[data-local-date]").forEach((node) => {
    const timestamp = Number(node.getAttribute("data-local-date"));
    if (!timestamp) return;
    node.textContent = dateFormatter.format(new Date(timestamp * 1000));
  });
})();
