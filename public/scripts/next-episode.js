(() => {
  const buttons = document.querySelectorAll("[data-next-episode-ics]");
  if (!buttons.length) return;

  const message = document.querySelector("[data-next-episode-message]");

  const formatIcsDate = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const escapeIcsText = (value = "") =>
    String(value)
      .replaceAll("\\", "\\\\")
      .replaceAll(";", "\\;")
      .replaceAll(",", "\\,")
      .replace(/\r?\n/g, "\\n");

  const safeFileName = (value = "airing-atlas-reminder") =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "airing-atlas-reminder";

  const setMessage = (value) => {
    if (message) message.textContent = value;
  };

  const track = (eventName, params = {}) => {
    if (typeof window.airingAtlasTrack === "function") {
      window.airingAtlasTrack(eventName, params);
    }
  };

  const downloadReminder = (button) => {
    const timestamp = Number(button.dataset.icsAiringAt || 0);
    if (!timestamp) {
      setMessage("Calendar reminder is unavailable until the next episode time is listed.");
      return;
    }

    const title = button.dataset.title || "Anime episode";
    const episode = button.dataset.episode || "TBA";
    const url = button.dataset.url || window.location.href;
    const start = new Date(timestamp * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const eventTitle = `${title} episode ${episode}`;
    const uid = `airing-atlas-${safeFileName(title)}-${timestamp}@airingatlas.com`;
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Airing Atlas//Next Episode Reminder//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${escapeIcsText(eventTitle)}`,
      `DESCRIPTION:${escapeIcsText("Airing Atlas reminder. Use official services and regional rights holders when you are ready to watch.")}`,
      `URL:${escapeIcsText(url)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([`${body}\r\n`], { type: "text/calendar;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${safeFileName(eventTitle)}.ics`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setMessage("Calendar reminder downloaded.");
    track("next_episode_ics_download", {
      anime_title: title,
      episode,
      airing_at: timestamp
    });
  };

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const button = target?.closest?.("[data-next-episode-ics]");
    if (!button) return;
    downloadReminder(button);
  });
})();
