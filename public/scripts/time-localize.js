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

  document.querySelectorAll("[data-local-date]").forEach((node) => {
    const timestamp = Number(node.getAttribute("data-local-date"));
    if (!timestamp) return;
    node.textContent = dateFormatter.format(new Date(timestamp * 1000));
  });
})();
