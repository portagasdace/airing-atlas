export interface EditorialGuide {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  updated: string;
  lede: string;
  thesis: string;
  sections: Array<{
    eyebrow: string;
    heading: string;
    body: string[];
  }>;
  comparisonRows?: Array<{
    status: string;
    meaning: string;
    viewerImpact: string;
  }>;
  checklist: string[];
  internalLinks: Array<{
    label: string;
    href: string;
    note: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export const guides: EditorialGuide[] = [
  {
    slug: "how-to-choose-anime-by-mood",
    title: "How to Choose Anime by Mood",
    shortTitle: "Choose by mood",
    description: "A practical Airing Atlas guide to choosing anime by mood, time, status, and emotional weight instead of only genre labels.",
    updated: "2026-06-25",
    lede: "Genre is a useful starting point, but it is rarely how people actually decide what to watch tonight. Mood, time, energy, and tolerance for unfinished stories usually matter more.",
    thesis: "The best anime recommendation is not simply the highest rated title. It is the title that matches the viewer's current attention span, emotional appetite, and willingness to follow a longer route.",
    sections: [
      {
        eyebrow: "Decision frame",
        heading: "Start with the viewing job",
        body: [
          "Before picking a title, name the job you want the anime to do. A one-night watch needs a different answer than a month-long franchise project. A comfort watch needs different pacing than a dark mystery.",
          "Airing Atlas separates this decision into mood, length, and status because those are the filters that prevent regret. If you only search by genre, you can still end up with a perfect show at the wrong moment."
        ]
      },
      {
        eyebrow: "Mood signals",
        heading: "Translate mood into watchable traits",
        body: [
          "Dark usually means danger, secrecy, violence, or moral pressure. Romance usually means relationship focus, emotional pacing, and a lower need to track lore. Mind-game means rules, deception, planning, and consequences.",
          "The useful move is to pair the mood with a practical constraint. 'Dark short finished anime' is far more actionable than 'dark anime' because it tells the recommendation system what kind of commitment is acceptable."
        ]
      },
      {
        eyebrow: "Status matters",
        heading: "Decide whether waiting is part of the fun",
        body: [
          "Airing anime can be exciting if you enjoy weekly conversation, but it is a poor fit when you want closure tonight. Finished anime is safer for binge plans because every recommendation can be judged as a complete route.",
          "If you are new to a genre, start finished. If you already know the franchise and want to follow the crowd, airing titles can be worth the uncertainty."
        ]
      }
    ],
    checklist: [
      "Pick the time box first: one night, weekend, month, or long route.",
      "Choose one dominant mood instead of stacking many moods.",
      "Prefer finished anime when you want closure.",
      "Use similar-anime guides when you already have a reference title.",
      "Use watch-order pages only when the franchise has sequels, movies, or OVAs."
    ],
    internalLinks: [
      { label: "Anime Finder", href: "/anime-finder/", note: "Choose by mood, length, and status." },
      { label: "Binge Planner", href: "/binge-planner/", note: "Turn a decision into a shareable route." },
      { label: "Dark fantasy anime", href: "/discover/dark-fantasy-anime/", note: "A concrete mood-based example." }
    ],
    faq: [
      {
        question: "Is mood better than genre for anime recommendations?",
        answer: "Mood is often better for the first decision because it describes what the viewer wants to feel. Genre is still useful after the mood and time commitment are clear."
      },
      {
        question: "Should I start with finished anime?",
        answer: "Yes if you want a complete story or a weekend binge. Airing anime is better when weekly discussion and release timing are part of the appeal."
      },
      {
        question: "How does Airing Atlas use mood?",
        answer: "Airing Atlas uses mood as a practical filter that is combined with length, status, score, popularity, genre, and known reference titles."
      }
    ]
  },
  {
    slug: "watch-order-vs-release-order",
    title: "Watch Order vs Release Order",
    shortTitle: "Watch order basics",
    description: "Learn when to use story watch order, release order, and optional OVA or movie notes before starting a long anime franchise.",
    updated: "2026-06-25",
    lede: "Anime franchises often have seasons, movies, OVAs, specials, recap films, and spin-offs. The right order depends on whether you want story clarity or historical release context.",
    thesis: "Use story order for a clean first watch, release order for franchise history, and optional notes to keep recap movies or side stories from interrupting the main path.",
    sections: [
      {
        eyebrow: "First watch",
        heading: "Story order is usually the safest default",
        body: [
          "A first-time viewer usually needs momentum. Story order keeps direct sequels and prequels near the plot they explain, which reduces confusion and avoids turning a franchise into homework.",
          "This is why Airing Atlas watch-order pages start with a recommended route before listing release order. The goal is to help someone start, not to display every related entry equally."
        ]
      },
      {
        eyebrow: "Franchise history",
        heading: "Release order has a different purpose",
        body: [
          "Release order is best when you care about how original audiences experienced the story. It can preserve reveals, production context, and the feeling of waiting between arcs.",
          "Release order is not always the easiest path. It may include recap movies, side stories, or promotional specials that are interesting later but distracting at the beginning."
        ]
      },
      {
        eyebrow: "Optional material",
        heading: "Movies and OVAs need labels, not panic",
        body: [
          "A movie can be essential, optional, or mostly a recap. An OVA can be a useful side story or a bonus episode that changes nothing. The label matters more than the format.",
          "Airing Atlas separates main route, release path, and optional material so viewers can choose how complete they want the run to be."
        ]
      }
    ],
    checklist: [
      "Use recommended order for your first watch.",
      "Use release order when you care about original broadcast context.",
      "Skip recap movies unless you want a refresher.",
      "Treat comedy spin-offs as optional unless the guide says otherwise.",
      "Check legal watching notes before assuming a title is available in your region."
    ],
    internalLinks: [
      { label: "Watch order hub", href: "/watch-order/", note: "Browse current curated franchise paths." },
      { label: "Attack on Titan watch order", href: "/watch-order/16498-attack-on-titan/", note: "A high-stakes franchise example." },
      { label: "Demon Slayer watch order", href: "/watch-order/101922-demon-slayer-kimetsu-no-yaiba/", note: "A movie-vs-TV-arc example." }
    ],
    faq: [
      {
        question: "Is release order always best?",
        answer: "No. Release order is useful for historical context, but story order is often clearer for a first-time viewer."
      },
      {
        question: "Are anime movies usually required?",
        answer: "Some are required, but many are optional or recap material. A good watch-order guide should tell you which role each movie plays."
      },
      {
        question: "Does Airing Atlas host episodes?",
        answer: "No. Airing Atlas provides franchise maps, schedules, and discovery guidance. It does not host streams or downloads."
      }
    ]
  },
  {
    slug: "best-anime-for-beginners",
    title: "Best Anime for Beginners: How to Pick a First Route",
    shortTitle: "Beginner anime",
    description: "A beginner-friendly guide to picking anime by clarity, commitment, tone, and completion status instead of chasing only famous titles.",
    updated: "2026-06-25",
    lede: "The best first anime is not always the most famous anime. A good beginner route should be easy to enter, clear about its promise, and honest about the time commitment.",
    thesis: "For new viewers, clarity beats scale. Start with a title that shows what anime can do without demanding a massive franchise commitment on day one.",
    sections: [
      {
        eyebrow: "Entry point",
        heading: "Choose a clean promise",
        body: [
          "A beginner title should make its appeal obvious within the first few episodes. Demon hunting, mind games, sports teamwork, romantic tension, or a complete adventure are all clear promises.",
          "Avoid starting with a franchise only because it is famous. If the first route is too long or too tangled, the viewer may blame anime instead of the entry point."
        ]
      },
      {
        eyebrow: "Commitment",
        heading: "Short and complete can be stronger than legendary",
        body: [
          "A 12- or 24-episode finished series gives a new viewer a full experience quickly. It also makes it easier to talk about what worked: pacing, characters, animation, comedy, or emotional payoff.",
          "Long shows are not bad beginner picks, but they should match the viewer's appetite for a long-term project."
        ]
      },
      {
        eyebrow: "Personal fit",
        heading: "Use a familiar non-anime preference",
        body: [
          "If someone likes crime thrillers, start near deduction or psychological pressure. If they like superhero stories, start with training, powers, and mentor dynamics. If they like fantasy adventure, start with a complete journey.",
          "The bridge from an existing taste is more reliable than a universal top-ten list."
        ]
      }
    ],
    checklist: [
      "Pick a finished title when possible.",
      "Keep the first route under 26 episodes unless the viewer asks for a long series.",
      "Match a familiar genre from movies, games, or TV.",
      "Avoid recap movies and side material for the first route.",
      "Use watchlist status to separate 'try next' from 'long-term project'."
    ],
    internalLinks: [
      { label: "Finished Anime Finder", href: "/finished-anime/", note: "Find complete series first." },
      { label: "Anime Finder", href: "/anime-finder/", note: "Filter by mood and length." },
      { label: "Anime like Demon Slayer", href: "/anime-like/demon-slayer/", note: "A clean action gateway example." }
    ],
    faq: [
      {
        question: "Should beginners start with long anime?",
        answer: "Only if they want a long project. Most beginners are better served by a clear, finished, shorter route first."
      },
      {
        question: "Is a famous anime automatically beginner-friendly?",
        answer: "No. Fame helps with recognition, but pacing, length, and tone matter more for a first experience."
      },
      {
        question: "What should I use Airing Atlas for as a beginner?",
        answer: "Use Anime Finder for mood, Finished Anime for complete routes, and watch-order pages only after choosing a franchise."
      }
    ]
  },
  {
    slug: "finished-anime-vs-airing-anime",
    title: "Finished Anime vs Airing Anime",
    shortTitle: "Finished vs airing",
    description: "A practical guide to choosing between completed anime and currently airing shows based on closure, conversation, spoilers, and schedule pressure.",
    updated: "2026-06-25",
    lede: "Finished anime and airing anime solve different problems. One gives control and closure; the other gives freshness, weekly conversation, and the fun of not knowing what comes next.",
    thesis: "Choose finished anime when you want certainty. Choose airing anime when the schedule itself is part of the experience.",
    sections: [
      {
        eyebrow: "Finished routes",
        heading: "Finished anime is better for planned watching",
        body: [
          "When every episode is available, you can judge the time commitment before starting. That makes finished anime better for binge plans, beginner recommendations, and mood-based discovery.",
          "Finished anime also reduces the risk of a recommendation turning into an unresolved wait. If closure matters tonight, completed status is the strongest filter."
        ]
      },
      {
        eyebrow: "Airing routes",
        heading: "Airing anime is better for shared timing",
        body: [
          "Airing anime works when you want to follow a season with other viewers. Release timing, next episode countdowns, and weekly discussion become part of the value.",
          "The tradeoff is uncertainty. Delays, changing arcs, and incomplete payoff are normal. That does not make airing anime worse; it makes it a different product."
        ]
      },
      {
        eyebrow: "Hybrid use",
        heading: "Mix one airing show with one finished route",
        body: [
          "A good viewing week can have both: one airing title for freshness and one finished show for control. This keeps the schedule lively without making every decision depend on release timing.",
          "Airing Atlas is built around this split: calendar and next episode pages for fresh shows, planner and finished-anime pages for complete routes."
        ]
      }
    ],
    checklist: [
      "Pick finished anime for weekends, travel, or low-spoiler viewing.",
      "Pick airing anime when weekly conversation is part of the appeal.",
      "Use calendar pages to avoid missing fresh episodes.",
      "Use binge plans when you want a complete route.",
      "Do not judge an airing show like a finished story until it has enough episodes."
    ],
    internalLinks: [
      { label: "Finished Anime Finder", href: "/finished-anime/", note: "Completed routes by length and mood." },
      { label: "Airing Calendar", href: "/calendar/", note: "Upcoming episode schedule." },
      { label: "Next Episode hub", href: "/next-episode/", note: "Fresh release timing pages." }
    ],
    faq: [
      {
        question: "Is finished anime better than airing anime?",
        answer: "Not always. Finished anime is better for closure and planning; airing anime is better for weekly discussion and fresh releases."
      },
      {
        question: "How many airing anime should I follow?",
        answer: "A small number is usually better. Pair one or two airing titles with finished routes so your watchlist does not depend entirely on weekly releases."
      },
      {
        question: "Why does Airing Atlas track both?",
        answer: "Fans need both decisions: what to watch now and what airs next. The site separates those workflows so each page has a clear job."
      }
    ]
  },
  {
    slug: "how-airing-atlas-recommends-similar-anime",
    title: "How Airing Atlas Recommends Similar Anime",
    shortTitle: "Recommendation method",
    description: "A transparent explanation of how Airing Atlas combines AniList signals, shared genres, tags, popularity, and editorial judgment for similar anime pages.",
    updated: "2026-06-25",
    lede: "Similar anime recommendations are easy to make badly. Two shows can share a genre and still feel nothing alike, while two different genres can create the same viewing pressure.",
    thesis: "Airing Atlas treats similar anime as a decision path, not a keyword list. The best match must explain why it belongs next to the reference title.",
    sections: [
      {
        eyebrow: "Signals",
        heading: "Start with public data, then make it readable",
        body: [
          "Airing Atlas uses AniList catalog data, recommendation signals, genres, tags, score, popularity, status, and format as the first layer. Those signals help avoid random picks.",
          "The second layer is explanation. A recommendation card is not useful unless it says whether the match is about tone, structure, characters, setting, power systems, or emotional pressure."
        ]
      },
      {
        eyebrow: "Editorial layer",
        heading: "Manual guides exist for high-intent searches",
        body: [
          "Pages such as anime like Attack on Titan or anime like Demon Slayer receive manual notes because users searching those phrases usually want a real judgment, not just an automated list.",
          "The guide calls out best overall picks, match angles, related routes, and FAQ answers so the page can help a viewer decide what to watch next."
        ]
      },
      {
        eyebrow: "Boundaries",
        heading: "Similar does not mean identical",
        body: [
          "A good similar recommendation may share only one important trait. 86 is not Attack on Titan with different monsters; it is a match because of military tragedy, class oppression, and battlefield pressure.",
          "That distinction matters because viewers usually want the feeling or decision shape, not a clone."
        ]
      }
    ],
    checklist: [
      "Look for the strongest shared viewing reason, not only shared genre.",
      "Prefer explained recommendations over anonymous lists.",
      "Use a known reference title when mood filters are too broad.",
      "Check status and length before committing.",
      "Use watch-order pages when the next step is a franchise, not a single show."
    ],
    internalLinks: [
      { label: "Anime like Attack on Titan", href: "/anime-like/attack-on-titan/", note: "A military tragedy and survival-pressure example." },
      { label: "Anime like Jujutsu Kaisen", href: "/anime-like/jujutsu-kaisen/", note: "A supernatural action example." },
      { label: "Similar Anime Finder", href: "/similar/", note: "A broader live recommendation tool." }
    ],
    faq: [
      {
        question: "Does Airing Atlas only use automated data?",
        answer: "No. Automated data provides candidates, but high-intent guide pages add manual editorial explanations and FAQ sections."
      },
      {
        question: "Why are some anime-like pages indexed and others not?",
        answer: "During AdSense review, only pages with enough manual editorial value should be indexed. Broader matching still works through the live Similar Anime Finder."
      },
      {
        question: "Can two different genres still be similar?",
        answer: "Yes. Similarity can come from structure, pressure, character dynamics, or moral stakes rather than genre labels alone."
      }
    ]
  },
  {
    slug: "what-does-finished-airing-mean-in-anime",
    title: "What Does Finished Airing Mean in Anime?",
    shortTitle: "Finished airing meaning",
    description: "Learn what finished airing means in anime, how it differs from a completed story, and what releasing, hiatus, cancelled, and not yet released statuses mean.",
    updated: "2026-07-10",
    lede: "Finished airing means the listed broadcast run has released its final scheduled episode. It does not automatically mean the adaptation covered the entire source story or that another season will never happen.",
    thesis: "Treat finished airing as a release-status fact, not a promise of total story completion. It tells you the current episode run is available to finish; the franchise may still continue later.",
    sections: [
      {
        eyebrow: "Plain answer",
        heading: "The broadcast run has ended",
        body: [
          "When a catalog labels an anime as finished airing, the episodes assigned to that season, series, OVA, or movie release have finished coming out. A 12-episode season marked finished should no longer require a weekly wait for episode 13 unless a separate continuation is announced.",
          "The label describes distribution, not narrative completeness. A season can stop at the end of one arc while the manga, light novel, or larger anime franchise continues. That is why Airing Atlas separates release status from watch order and sequel information."
        ]
      },
      {
        eyebrow: "Story completion",
        heading: "Finished airing is not the same as finished story",
        body: [
          "Some finished anime adapt a complete story and reach a deliberate ending. Others finish only their current cour or season. Both can carry the same status because the scheduled broadcast itself is over.",
          "Before starting a binge, check whether the page lists sequels, related movies, or a watch-order guide. A finished first season can be safe to watch in one sitting while still ending on a continuation point."
        ]
      },
      {
        eyebrow: "Viewer decision",
        heading: "Use status to remove weekly waiting",
        body: [
          "Finished status is useful when your priority is availability. Every listed episode in that run should already be released, so you can estimate the total time and build a weekend or one-night plan without depending on a future broadcast date.",
          "If closure matters more than availability, add a second check: look for a complete adaptation, an anime-original ending, or a final season. Status alone cannot answer whether every character or plot thread is resolved."
        ]
      },
      {
        eyebrow: "Catalog language",
        heading: "Other statuses answer different questions",
        body: [
          "Releasing means new episodes are still expected. Not yet released means the title has an announced or recorded entry but has not started. Hiatus means publication or broadcast is paused without being treated as complete. Cancelled means the planned run stopped and should not be assumed to resume.",
          "These labels can change when distributors announce delays, sequels, or revised schedules. Airing Atlas refreshes public catalog data regularly, while editorial guides explain how to use the label when choosing what to watch."
        ]
      }
    ],
    comparisonRows: [
      { status: "Finished", meaning: "The scheduled release run has ended.", viewerImpact: "All episodes in that run should be available, but the wider story may continue." },
      { status: "Releasing", meaning: "New episodes are still being released.", viewerImpact: "Expect weekly waiting, schedule changes, or an incomplete current arc." },
      { status: "Not yet released", meaning: "The title is announced but has not started.", viewerImpact: "There is no complete episode run to watch yet." },
      { status: "Hiatus", meaning: "The release is paused without being complete.", viewerImpact: "A return date may be uncertain, so closure cannot be assumed." },
      { status: "Cancelled", meaning: "The planned release stopped.", viewerImpact: "The available material may remain incomplete with no continuation." }
    ],
    checklist: [
      "Use finished status when you want every episode in the current run available.",
      "Check sequels before assuming the complete franchise is over.",
      "Check episode count before building a one-night or weekend plan.",
      "Use a watch-order guide when seasons, movies, or OVAs continue the story.",
      "Treat status as current catalog information that may change after new announcements."
    ],
    internalLinks: [
      { label: "Finished Anime Finder", href: "/finished-anime/", note: "Browse completed release runs by length and mood." },
      { label: "Finished vs airing anime", href: "/guides/finished-anime-vs-airing-anime/", note: "Compare closure and weekly viewing." },
      { label: "Binge Planner", href: "/binge-planner/?finished=true", note: "Build a route from finished titles." }
    ],
    faq: [
      { question: "Does finished airing mean the anime story is complete?", answer: "No. It means the current scheduled broadcast run ended. The source story or anime franchise may continue in another season, movie, or adaptation." },
      { question: "Can I binge an anime marked finished airing?", answer: "Usually yes for that listed run, because its scheduled episodes should already be available. Check the episode count and sequel list before assuming the whole franchise is complete." },
      { question: "Can a finished anime get another season?", answer: "Yes. A finished status can describe one completed season. A later sequel is normally recorded as a separate entry or changes the franchise route." },
      { question: "What is the difference between finished and cancelled?", answer: "Finished means the scheduled run reached its end. Cancelled means the planned release stopped and may remain incomplete." }
    ]
  },
  {
    slug: "how-many-episodes-before-dropping-an-anime",
    title: "How Many Episodes Should You Watch Before Dropping an Anime?",
    shortTitle: "When to drop an anime",
    description: "A practical alternative to the three-episode rule, with better stopping points for episodic shows, slow burns, mysteries, and long-running anime.",
    updated: "2026-07-14",
    lede: "The three-episode rule is useful only when three episodes reveal the real shape of a show. A better rule is to watch until the anime has demonstrated its normal rhythm, then decide whether that rhythm is worth more of your time.",
    thesis: "Do not wait for a famous future arc just because other viewers promise a payoff. Give the show enough time to state its usual pace and conflict, then judge the experience you are actually having.",
    sections: [
      {
        eyebrow: "The common rule",
        heading: "Three episodes is a checkpoint, not a contract",
        body: [
          "Three episodes often cover the premise, the first complication, and a small payoff. That makes the checkpoint useful for many 12-episode seasonal shows, but it is not a universal measure of quality or patience.",
          "A comedy may reveal its voice in one episode. A mystery may need four episodes to establish the question it wants you to solve. A long-running adventure may have a complete introductory mini-arc that is a better stopping point than an arbitrary episode number."
        ]
      },
      {
        eyebrow: "Decision signal",
        heading: "Ask whether the normal episode is enjoyable",
        body: [
          "Pilots receive extra attention, and climactic episodes receive extra praise. The more useful test is the ordinary episode between those peaks. Do you enjoy the conversations, movement, humor, tension, or atmosphere when the story is not revealing a major twist?",
          "If the normal rhythm feels like work, a promised payoff may not repair the hours required to reach it. If the rhythm is pleasant but the plot is still forming, one more checkpoint may be reasonable."
        ]
      },
      {
        eyebrow: "Different formats",
        heading: "Use a stopping point that matches the show",
        body: [
          "For an episodic comedy or slice-of-life title, two representative episodes can be enough. For a 12-episode thriller, three episodes usually reveal the central mechanism. For a slow-burn drama, try the end of the first clear character conflict rather than waiting for the halfway point.",
          "For a long franchise, finish the introductory arc and then ask whether you want the next problem. Do not use a 50-episode fan milestone as your first decision point unless the early journey already has something you value."
        ]
      },
      {
        eyebrow: "Permission to stop",
        heading: "Dropping a show is a watchlist decision, not a verdict",
        body: [
          "A dropped status does not mean the anime is objectively bad. It means the current fit between show, viewer, and moment is weak. A dense political story may work better later; a loud comedy may never fit your taste.",
          "Record a short reason such as pacing, tone, repetition, or current mood. That note is more useful than a score because it helps the next recommendation avoid the same mismatch."
        ]
      }
    ],
    checklist: [
      "Identify whether the show is episodic, arc-based, or a continuous mystery.",
      "Reach the first point that demonstrates the normal rhythm.",
      "Judge the ordinary episodes, not only the pilot or promised climax.",
      "Stop when curiosity is being replaced by obligation.",
      "Save a brief drop reason so the next pick can be better."
    ],
    internalLinks: [
      { label: "Anime Finder", href: "/anime-finder/", note: "Replace the dropped show with a better mood and length fit." },
      { label: "Build a realistic watchlist", href: "/guides/how-to-build-an-anime-watchlist/", note: "Keep planned titles from becoming a backlog." },
      { label: "Watch Next", href: "/watch-next/", note: "Choose one immediate replacement instead of adding ten maybes." }
    ],
    faq: [
      { question: "Is the three-episode rule good for every anime?", answer: "No. It is a useful checkpoint for many short seasonal shows, but episodic series, mysteries, and long arc-based anime reveal their normal rhythm at different points." },
      { question: "Should I continue because fans say it gets better?", answer: "Continue only if the current experience offers something you value. A later payoff does not automatically justify many unenjoyable hours." },
      { question: "Can I return to a dropped anime later?", answer: "Yes. Dropped can mean not a fit right now. Save the episode and a short reason so you can make a better decision if your mood changes." },
      { question: "Does dropping anime make my ratings less reliable?", answer: "No. A clear reason for stopping can be more informative than finishing from obligation and assigning a frustrated score." }
    ]
  },
  {
    slug: "are-anime-recap-movies-worth-watching",
    title: "Are Anime Recap Movies Worth Watching?",
    shortTitle: "Anime recap movies",
    description: "Learn when an anime recap movie is useful, when it is safely skippable, and how to tell a compilation film from a required sequel movie.",
    updated: "2026-07-14",
    lede: "A recap movie compresses material you may already know. Its value depends on what changed: editing, animation, sound, framing scenes, or the amount of time since you watched the original season.",
    thesis: "Skip a recap movie on a first watch unless it is the only official route you can access or the guide identifies meaningful new material. Use it later as a refresher, alternate edit, or production comparison.",
    sections: [
      {
        eyebrow: "First distinction",
        heading: "Recap, sequel, and remake are different jobs",
        body: [
          "A compilation or summary movie retells existing episodes in a shorter theatrical cut. A sequel movie continues the story after a series. A remake may cover familiar events with a new production and can become its own valid route.",
          "The word movie does not reveal which job the entry performs. Check its relation label and description before placing it in a watch order. A sequel can be essential while a recap of the preceding season is optional."
        ]
      },
      {
        eyebrow: "Good use",
        heading: "A recap is strongest when memory is the problem",
        body: [
          "If several years passed between seasons, a compact refresher can restore names, factions, and unresolved conflicts without replaying an entire cour. It can also help a group synchronize before starting a sequel together.",
          "Recap films are also useful for viewers interested in editing. Removing weekly openings, repeated explanations, and episode cliffhangers can change the pace, even when the plot information is familiar."
        ]
      },
      {
        eyebrow: "Weak use",
        heading: "Compression usually sacrifices texture",
        body: [
          "A two-hour film cannot preserve every quiet scene from a full television season. Character transitions, comedy, side relationships, and gradual atmosphere are often the first material removed.",
          "That makes most recap movies a poor substitute for a first watch when character development is the main appeal. Faster is not automatically clearer, especially if the edit assumes the audience already understands the world."
        ]
      },
      {
        eyebrow: "Watch-order rule",
        heading: "Label optional material instead of hiding it",
        body: [
          "A useful watch-order guide should keep recap movies visible but separate from the main route. Hiding them prevents completionists from finding them; treating them as mandatory creates unnecessary friction for everyone else.",
          "Airing Atlas places summary and alternative entries after the main route unless a manual note explains that new scenes materially affect the continuation."
        ]
      }
    ],
    checklist: [
      "Confirm whether the movie is labeled summary, alternative, sequel, or side story.",
      "Skip summaries during a first watch when the full season is available.",
      "Use a recap before a sequel when your memory is weak.",
      "Check for new framing scenes or animation before dismissing the film entirely.",
      "Keep recap entries optional in a shared watch plan."
    ],
    internalLinks: [
      { label: "Watch order vs release order", href: "/guides/watch-order-vs-release-order/", note: "Choose the right route for a first watch." },
      { label: "Anime Watch Order", href: "/watch-order/", note: "See manual routes with optional entries separated." },
      { label: "Demon Slayer watch order", href: "/watch-order/101922-demon-slayer-kimetsu-no-yaiba/", note: "A useful movie-versus-TV-arc example." }
    ],
    faq: [
      { question: "Can I skip anime recap movies?", answer: "Usually yes if you already watched the television material. Check the guide for new scenes or a special edit before skipping." },
      { question: "Is every anime movie optional?", answer: "No. Some movies are direct sequels or required story arcs. The relation to the series matters more than the format." },
      { question: "Are recap movies good for first-time viewers?", answer: "Usually the full series is better because it preserves character and pacing detail. A recap can work when access or time makes it the only practical official route." },
      { question: "Why list a movie if it is skippable?", answer: "Optional does not mean worthless. Completionists, returning viewers, and production-focused fans may still want the alternate edit." }
    ]
  },
  {
    slug: "how-to-build-an-anime-watchlist",
    title: "How to Build an Anime Watchlist You Will Actually Finish",
    shortTitle: "Build a useful watchlist",
    description: "Turn an oversized anime backlog into a small active queue with clear roles, realistic limits, drop reasons, and a weekly review habit.",
    updated: "2026-07-14",
    lede: "A watchlist stops being useful when every interesting title becomes an equal priority. The solution is not a better ranking algorithm; it is a smaller active queue with different jobs for different shows.",
    thesis: "Keep discovery broad but commitment narrow. Store many possibilities if you enjoy collecting them, but promote only three titles into the queue you expect to watch next.",
    sections: [
      {
        eyebrow: "Queue design",
        heading: "Give each active title a job",
        body: [
          "A balanced queue can contain one easy show, one focused story, and one long project. The easy show works when energy is low. The focused story gets deliberate attention. The long project advances without pretending it must be finished this month.",
          "Titles compete less when their jobs differ. Three intense mysteries create a decision every night; a comedy, a thriller, and a long adventure each have an obvious moment."
        ]
      },
      {
        eyebrow: "Hard limit",
        heading: "Use a three-title active queue",
        body: [
          "Three is large enough to offer choice and small enough to remember why each title is there. When one title is completed or dropped, promote a replacement from the broader planned list.",
          "Airing shows can sit in a separate weekly slot because release timing controls their pace. Do not let six weekly shows quietly become six unfinished binge projects."
        ]
      },
      {
        eyebrow: "Selection notes",
        heading: "Save a reason, not only a title",
        body: [
          "Write one sentence when adding a show: short emotional drama, tactical fights, comfort comedy, or finish before the next season. That sentence preserves the original motivation after the recommendation page is forgotten.",
          "If the reason no longer appeals, remove the title without guilt. A watchlist is a decision aid, not a museum of every recommendation you have encountered."
        ]
      },
      {
        eyebrow: "Maintenance",
        heading: "Review the queue once a week",
        body: [
          "A weekly review should take less than five minutes. Mark progress, close completed titles, record one reason for anything dropped, and confirm that the next three still match your available time.",
          "Do not reorganize the entire catalog. The purpose of the review is to remove friction from the next viewing decision, not to perfect a database."
        ]
      }
    ],
    checklist: [
      "Keep no more than three non-airing titles in the active queue.",
      "Assign each title a different viewing job.",
      "Write one sentence explaining why you added it.",
      "Promote a replacement only after completing or dropping a title.",
      "Review progress and drop reasons once a week."
    ],
    internalLinks: [
      { label: "Anime Finder", href: "/anime-finder/", note: "Find a title for a specific queue role." },
      { label: "Binge Planner", href: "/binge-planner/", note: "Turn selected titles into a bounded route." },
      { label: "When to drop an anime", href: "/guides/how-many-episodes-before-dropping-an-anime/", note: "Remove obligation from the active queue." }
    ],
    faq: [
      { question: "How many anime should be on my active watchlist?", answer: "Three non-airing titles is a practical default: one easy show, one focused story, and one long project. Keep broader possibilities in a separate planned list." },
      { question: "Should airing anime count toward the limit?", answer: "Track them separately because weekly release timing controls their pace. Still limit the number if keeping up begins to feel like an obligation." },
      { question: "Should I delete anime I may watch someday?", answer: "Not necessarily. Keep a broad discovery list if you enjoy it, but separate it from the small queue that drives your next decision." },
      { question: "What should I write when adding a title?", answer: "Save the viewing reason and expected commitment, such as a short finished mystery for a weekend or a long adventure for one episode a night." }
    ]
  },
  {
    slug: "how-long-does-it-take-to-watch-an-anime",
    title: "How Long Does It Take to Watch an Anime?",
    shortTitle: "Estimate anime watch time",
    description: "Estimate anime watch time for 12, 24, 50, and 100 episodes, then adjust for openings, endings, recaps, breaks, and realistic viewing pace.",
    updated: "2026-07-14",
    lede: "A standard television episode is often scheduled for about 24 minutes, but practical watch time depends on whether you skip openings, take breaks, or watch recap-heavy episodes. A useful estimate should show both screen time and calendar time.",
    thesis: "Use 24 minutes per episode for a safe first estimate, then plan by sessions rather than pretending every available hour will become uninterrupted viewing time.",
    sections: [
      {
        eyebrow: "Quick estimate",
        heading: "Multiply episodes by 24 minutes",
        body: [
          "A 12-episode season is roughly 4 hours 48 minutes before breaks. Twenty-four episodes are about 9 hours 36 minutes. Fifty episodes are about 20 hours, and one hundred episodes are about 40 hours.",
          "These are planning numbers, not exact runtimes. Double-length premieres, shorts, recap episodes, and movies can change the total. Check the actual format when a route mixes television episodes with films or OVAs."
        ]
      },
      {
        eyebrow: "Skipping credits",
        heading: "Openings and endings save less time than people expect",
        body: [
          "Skipping a 90-second opening and 90-second ending can remove about three minutes per episode. Across 12 episodes, that saves roughly 36 minutes; across 24 episodes, roughly 72 minutes.",
          "The estimate is imperfect because some episodes place story material before or after the credits. Use the skip button deliberately rather than assuming every ending contains nothing new."
        ]
      },
      {
        eyebrow: "Calendar time",
        heading: "Convert hours into a viewing rhythm",
        body: [
          "A 12-episode season can fit into one long day, two comfortable evenings, or six days at two episodes per night. The same screen time feels very different depending on attention and sleep.",
          "For a 50-episode show, two episodes a night creates a 25-day route. Five episodes each weekend creates a ten-week route. Calendar estimates make long anime feel concrete without turning every free hour into a target."
        ]
      },
      {
        eyebrow: "Mixed franchises",
        heading: "Count required movies separately",
        body: [
          "A franchise route can include films, OVAs, and specials that do not fit the 24-minute rule. Add required movies using their listed runtimes and leave recap or side material out of the main estimate unless you intend to watch it.",
          "This is why a manual watch order is useful before estimating a franchise. The largest error is often not episode length; it is counting optional material as mandatory."
        ]
      }
    ],
    checklist: [
      "Start with episode count multiplied by 24 minutes.",
      "Subtract about three minutes per episode only if you skip both credits sequences.",
      "Add movies and long specials separately.",
      "Plan comfortable sessions with breaks instead of one theoretical marathon.",
      "Use a watch-order guide to remove optional recap material from the estimate."
    ],
    internalLinks: [
      { label: "Binge Planner", href: "/binge-planner/", note: "Build a route around a night, weekend, or month." },
      { label: "Finished Anime Finder", href: "/finished-anime/", note: "Choose a completed title by commitment." },
      { label: "Are recap movies worth watching?", href: "/guides/are-anime-recap-movies-worth-watching/", note: "Decide which movie time belongs in the route." }
    ],
    faq: [
      { question: "How long does a 12-episode anime take to watch?", answer: "At 24 minutes per episode, about 4 hours 48 minutes before breaks. Skipping both opening and ending sequences can reduce the total by roughly 36 minutes." },
      { question: "How long does a 24-episode anime take?", answer: "About 9 hours 36 minutes at the 24-minute estimate, or around 8 hours 24 minutes if three minutes of credits are skipped in every episode." },
      { question: "Can I finish 12 episodes in one day?", answer: "Yes, but two comfortable sessions are usually more realistic than five uninterrupted hours. Add meal and attention breaks to the calendar plan." },
      { question: "Do anime movies count as episodes?", answer: "No. Add each required movie by its own runtime. Recap and optional films should be counted only if you choose to include them." }
    ]
  }
];

export function guideBySlug(slug: string): EditorialGuide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
