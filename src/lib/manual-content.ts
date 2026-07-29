import { animeById, displayTitle, watchOrderFor } from "@/lib/anime";
import type { AnimeSummary, RelatedAnime, WatchOrderGuide } from "@/types/anime";

export interface ManualFAQ {
  question: string;
  answer: string;
}

export interface ManualEditorialEntry {
  animeId: number;
  intro: string;
  atlasTake: string;
  whoShouldWatch: string;
  beforeStarting: string;
  legalWatchingNote: string;
}

export interface ManualWatchOrderEntry {
  animeId: number;
  updated?: string;
  seoTitle?: string;
  seoDescription?: string;
  quickAnswer?: string;
  intro: string;
  recommendedOrder: number[];
  releaseOrder: number[];
  optionalEntries: number[];
  skipNotes: string;
  faq: ManualFAQ[];
  legalWatchingNote: string;
}

export interface ManualSimilarGuide {
  animeId: number;
  updated?: string;
  seoTitle?: string;
  seoDescription?: string;
  whoShouldWatch?: string;
  beforeStarting?: string;
  intro: string;
  whySimilar: string;
  bestOverallPick: number;
  matchAngles: Array<{
    label: string;
    description: string;
    animeIds: number[];
  }>;
  recommendationNotes: Record<number, string>;
  faq: ManualFAQ[];
  relatedGuideIds: number[];
}

export const manualFeaturedAnimeIds = [16498, 101922, 113415, 21, 20, 1535, 21459, 127230, 5114, 11061, 20954, 13601];

const legalWatchingNote =
  "Airing Atlas does not host episodes or link to unauthorized streams. Use official streaming, broadcaster, or publisher links where they are available in your region.";

export const manualEditorialByAnimeId: Record<number, ManualEditorialEntry> = {
  16498: {
    animeId: 16498,
    intro: "Attack on Titan is best searched as a tense survival war story: giant-horror spectacle at first, then conspiracy, politics, and military tragedy as the cast learns what the world really is.",
    atlasTake: "Airing Atlas treats Attack on Titan as more than a dark action hit. Its value for discovery is the way each season changes the viewer's question: survival first, then truth, then the cost of choosing a side.",
    whoShouldWatch: "Start here if you want high-stakes mystery, military pressure, brutal reversals, and a story that rewards keeping track of factions and motives.",
    beforeStarting: "The early horror tone is only the entry point. Avoid recap movies on a first run, and expect later seasons to become more political and morally complicated.",
    legalWatchingNote
  },
  101922: {
    animeId: 101922,
    intro: "Demon Slayer works as a clean gateway pick for action fans: easy emotional stakes, high-end sword animation, demons, family loyalty, and a clear arc-by-arc release path.",
    atlasTake: "Demon Slayer is strongest as a polished gateway anime: simple emotional goals, clear training arcs, tragic enemy backstories, and fight scenes that make each arc easy to remember.",
    whoShouldWatch: "Pick it if you want accessible supernatural action, family-driven stakes, and a watch order that is easy to explain to a new anime fan.",
    beforeStarting: "The Mugen Train story exists as both a movie and TV arc. Choose one version first, then continue through the later seasonal arcs.",
    legalWatchingNote
  },
  113415: {
    animeId: 113415,
    intro: "Jujutsu Kaisen is a fast modern exorcist battle series, so the best adjacent picks usually share urban fantasy, curse-like monsters, sharp team chemistry, and stylish fights.",
    atlasTake: "Airing Atlas classifies Jujutsu Kaisen as a modern supernatural action anchor: it is fast, stylish, and easy to pair with other curse-hunting or demon-hunting shows.",
    whoShouldWatch: "Watch it if you like team missions, mentor figures, tactical powers, sharp comedy, and fights that move quickly without losing character chemistry.",
    beforeStarting: "Season 1 is the cleanest entry point. Jujutsu Kaisen 0 is not throwaway filler; watch it before or around Season 2 for better character context.",
    legalWatchingNote
  },
  21: {
    animeId: 21,
    intro: "One Piece is a long-running adventure first and a release-schedule problem second. New viewers usually need a simple main-series route, then movie and special notes as optional extras.",
    atlasTake: "One Piece is the site's long-form adventure benchmark. The useful question is not just whether it is good, but how to approach a huge main series without letting optional movies derail the path.",
    whoShouldWatch: "Choose it if you want found family, island-to-island discovery, emotional backstories, comedy, and a story that can become a long-term watchlist project.",
    beforeStarting: "The TV series is the core route. Movies and specials are best saved as optional side trips after you know the crew and world.",
    legalWatchingNote
  },
  20: {
    animeId: 20,
    intro: "Naruto is a character-growth shounen with a large sequel path, many movies, and plenty of side material. The safest guide keeps the main TV route separate from optional films.",
    atlasTake: "Naruto remains useful because it teaches the classic underdog-shounen pattern: rivalry, mentors, training, painful friendship, and a world that expands through village politics.",
    whoShouldWatch: "Start Naruto if you like long character growth, school-to-battle progression, emotional rivalries, and a large cast that keeps gaining history.",
    beforeStarting: "Keep the main TV route separate from movies and specials. Most films are optional, while Shippuden is the direct continuation.",
    legalWatchingNote
  },
  1535: {
    animeId: 1535,
    intro: "Death Note is a psychological cat-and-mouse thriller. Users searching for similar anime usually want mind games, moral pressure, crime tension, and high-stakes strategy.",
    atlasTake: "Death Note is the site's clearest mind-game reference point: the appeal is not action volume, but watching intelligent characters turn rules, pride, and secrecy into weapons.",
    whoShouldWatch: "Pick it if you want compact suspense, antihero tension, deduction, identity games, and moral pressure with very little filler.",
    beforeStarting: "The main TV series is the essential version. Recap specials can wait until after the full story, and they are not needed for a first watch.",
    legalWatchingNote
  },
  21459: {
    animeId: 21459,
    intro: "My Hero Academia blends superhero training, school arcs, tournaments, villains, and long-term character growth, making it useful for both watch-order and anime-like searches.",
    atlasTake: "My Hero Academia works as a bridge between superhero fiction and battle shounen. Its discovery value comes from school structure, class dynamics, and a society built around public hero work.",
    whoShouldWatch: "Watch it if you want hopeful training arcs, ensemble classmates, tournaments, mentors, rivalries, and villains that question the hero system.",
    beforeStarting: "Follow the TV seasons first. OVAs and films are extras, and they make more sense once the class and hero society are familiar.",
    legalWatchingNote
  },
  127230: {
    animeId: 127230,
    intro: "Chainsaw Man is useful for darker recommendation intent: chaotic supernatural action, horror comedy, broken characters, stylish violence, and a messy emotional core.",
    atlasTake: "Chainsaw Man is the messy counterweight to cleaner battle shounen. It matters because its comedy, horror, desire, and sadness all sit in the same scene instead of taking turns.",
    whoShouldWatch: "Pick it if you want supernatural action with rougher edges, damaged leads, brutal jokes, devils, and a tone that can flip quickly.",
    beforeStarting: "The main route is short for now, so it is easy to sample. Music videos and promotional extras are optional rather than story requirements.",
    legalWatchingNote
  },
  5114: {
    animeId: 5114,
    intro: "Fullmetal Alchemist: Brotherhood is a compact adventure drama with alchemy, military conspiracy, moral cost, and a complete ending, so users often need clear comparison guidance.",
    atlasTake: "Brotherhood is the site's complete-adventure benchmark: a finished story with strong plotting, moral cost, family bonds, and enough scale to feel epic without becoming endless.",
    whoShouldWatch: "Choose it if you want a full story, smart adventure, emotional payoff, military conspiracy, and powers with clear rules and consequences.",
    beforeStarting: "You do not need the 2003 adaptation first. Treat that version and the movies as alternate or optional material after Brotherhood.",
    legalWatchingNote
  },
  11061: {
    animeId: 11061,
    intro: "Hunter x Hunter is a long-form adventure built around tactical fights, changing arcs, and a deceptively playful start that grows stranger and darker as it goes.",
    atlasTake: "Hunter x Hunter is the site's tactical-adventure reference: it keeps changing arc shape, but the throughline is clever rules, strange tests, and fights won by reading the situation.",
    whoShouldWatch: "Watch it if you like adventure exams, strategic powers, morally odd enemies, and long-form character growth that does not always follow the expected shounen rhythm.",
    beforeStarting: "The 2011 series is the cleanest modern route. The older adaptation and movies are optional for viewers who want comparison material later.",
    legalWatchingNote
  }
};

export const manualWatchOrderByAnimeId: Record<number, ManualWatchOrderEntry> = {
  16498: {
    animeId: 16498,
    updated: "2026-07-29",
    intro: "For story flow, watch the TV seasons in sequence and treat OVAs as optional background material after the season they sit closest to.",
    recommendedOrder: [16498, 20811, 18397, 20958, 99634, 99147, 104578, 110277, 131681],
    releaseOrder: [16498, 18397, 20811, 20691, 20692, 21281, 20958, 99634, 99147, 104578, 110277, 131681],
    optionalEntries: [18397, 20811, 99634, 20691, 20692, 119113, 21281, 19391, 139754],
    skipNotes: "Recap movies such as Crimson Bow and Arrow, Wings of Freedom, and Chronicle can usually be skipped if you watch the TV seasons. Junior High is a comedy spin-off, not required for the main story.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch Attack on Titan OVAs?",
        answer: "They are optional but useful. No Regrets and Lost Girls add character context, while the TV seasons remain the main route."
      },
      {
        question: "Can I skip the Attack on Titan recap movies?",
        answer: "Yes. Recap films are mainly refreshers for viewers who already watched the matching seasons."
      },
      {
        question: "Should I start with Attack on Titan Season 1?",
        answer: "Yes. Start with Season 1, then continue through Season 2, Season 3, Season 3 Part 2, and the Final Season parts."
      }
    ]
  },
  101922: {
    animeId: 101922,
    updated: "2026-07-29",
    intro: "Demon Slayer is easiest if you watch Season 1, then either the Mugen Train movie or the TV version of that arc before later seasons.",
    recommendedOrder: [101922, 112151, 129874],
    releaseOrder: [101922, 112151, 129874],
    optionalEntries: [154541, 129627, 187383],
    skipNotes: "The Mugen Train movie and the Mugen Train TV arc cover the same core story. Most viewers only need one version unless they want every extra scene.",
    legalWatchingNote,
    faq: [
      {
        question: "Movie or TV arc for Mugen Train?",
        answer: "Watch the movie for the lean theatrical version, or the TV arc if you want the episodic version with a little extra material."
      },
      {
        question: "Are Kimetsu Academy specials required?",
        answer: "No. They are comedy extras and can be watched later."
      },
      {
        question: "Is Demon Slayer beginner-friendly?",
        answer: "Yes. Its main story path is direct, and the side material is easy to separate from the core viewing order."
      }
    ]
  },
  113415: {
    animeId: 113415,
    updated: "2026-07-29",
    seoTitle: "Jujutsu Kaisen Watch Order: JJK 0 & Seasons",
    seoDescription: "Watch Jujutsu Kaisen in order: Season 1, JJK 0, Season 2, then the Season 3 continuation. See which movies and recap entries are optional.",
    quickAnswer: "Start with Season 1, watch Jujutsu Kaisen 0 before Season 2, then continue through Season 2 and the Season 3 Culling Game route. Compilation material is optional and does not replace the main seasons.",
    intro: "Jujutsu Kaisen works in both release order and story order. New viewers can watch Season 1 first, then Jujutsu Kaisen 0, then Season 2.",
    recommendedOrder: [113415, 131573, 145064, 172463],
    releaseOrder: [113415, 131573, 145064, 172463],
    optionalEntries: [147463],
    skipNotes: "Jujutsu Kaisen 0 is important background for later character context. Recap and compilation releases are optional if you watched the matching season; they do not replace the main story route.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch Jujutsu Kaisen 0 before Season 1?",
        answer: "You can, but most new viewers should start with Season 1 and watch the movie before Season 2."
      },
      {
        question: "Is Jujutsu Kaisen 0 optional?",
        answer: "It is not just filler. It adds context for characters and events that matter later."
      },
      {
        question: "What comes after Jujutsu Kaisen Season 2?",
        answer: "The Culling Game continuation follows the Season 2 story path."
      },
      {
        question: "Is the Jujutsu Kaisen compilation movie required?",
        answer: "No. Compilation material recaps episodes you already watched and is not a replacement for Season 1, Jujutsu Kaisen 0, Season 2, or the Season 3 continuation."
      }
    ]
  },
  21: {
    animeId: 21,
    updated: "2026-07-29",
    intro: "For One Piece, the main TV series is the required path. Movies, recap specials, and event specials are best treated as optional side trips.",
    recommendedOrder: [21],
    releaseOrder: [466, 21, 459, 460, 461, 462, 1237, 1238, 4155, 12859, 21335, 105143, 141902],
    optionalEntries: [459, 460, 461, 462, 4155, 12859, 21335, 105143, 141902, 182469],
    skipNotes: "You can follow the TV series without watching the movies. Film: Strong World, Film: Z, Film: Gold, Stampede, and Film: Red are popular optional picks once you know the crew.",
    legalWatchingNote,
    faq: [
      {
        question: "Do I need One Piece movies for the main story?",
        answer: "No. The TV series is the main path; movies are optional side adventures."
      },
      {
        question: "Can I start with One Piece Film: Red?",
        answer: "It is better after you know the crew, because the movie assumes familiarity with major characters and the world."
      },
      {
        question: "Is the One Piece watch order just release order?",
        answer: "For the TV story, yes. Keep movies separate unless you want optional franchise extras."
      }
    ]
  },
  20: {
    animeId: 20,
    updated: "2026-07-29",
    intro: "The clean Naruto path is Naruto, Naruto: Shippuden, then later sequel material. Movies and specials are optional unless you are doing a completionist run.",
    recommendedOrder: [20, 1735, 16870, 97938],
    releaseOrder: [20, 442, 936, 2144, 1735, 2472, 4437, 6325, 8246, 10589, 16870, 97938],
    optionalEntries: [442, 936, 2144, 2472, 4437, 6325, 8246, 10589, 761, 594, 1074],
    skipNotes: "Most Naruto movies are optional side stories. The Last is more useful than the average movie because it bridges character context after Shippuden.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch Naruto before Shippuden?",
        answer: "Yes. Naruto sets up the characters, rivalries, and village politics that Shippuden builds on."
      },
      {
        question: "Are Naruto movies filler?",
        answer: "Most are optional side stories. Save them for later unless you want a full franchise run."
      },
      {
        question: "Where does Boruto fit?",
        answer: "Boruto is sequel-era material and should come after Naruto and Naruto: Shippuden."
      }
    ]
  },
  1535: {
    animeId: 1535,
    updated: "2026-07-14",
    intro: "Death Note is mostly a single complete TV route. Relight specials are recaps, not a required alternate order.",
    recommendedOrder: [1535],
    releaseOrder: [1535, 2994],
    optionalEntries: [2994],
    skipNotes: "Relight specials can be skipped if you watched the TV series. Death Parade is not part of a Death Note watch order.",
    legalWatchingNote,
    faq: [
      {
        question: "Is there a Death Note watch order?",
        answer: "The main TV series is the core order. Recap specials are optional."
      },
      {
        question: "Should I watch Death Note: Relight?",
        answer: "Only if you want a recap version after finishing the series."
      }
    ]
  },
  21459: {
    animeId: 21459,
    updated: "2026-07-14",
    intro: "My Hero Academia is best watched by TV season order. OVAs and movies are extras around the school and hero-work arcs.",
    recommendedOrder: [21459, 21856, 100166, 104276, 185736],
    releaseOrder: [21459, 21856, 87486, 100166, 104276, 185736],
    optionalEntries: [87486],
    skipNotes: "OVAs are optional training or side stories. Movies can be watched after you know the class and major hero society setup.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch My Hero Academia by season order?",
        answer: "Yes. The main TV seasons are the safest route for story continuity."
      },
      {
        question: "Are My Hero Academia OVAs required?",
        answer: "No. They are useful extras but not required for the main plot."
      },
      {
        question: "Where does Vigilantes fit?",
        answer: "Vigilantes is spin-off material. It is better after you understand the main hero society."
      }
    ]
  },
  127230: {
    animeId: 127230,
    updated: "2026-07-29",
    seoTitle: "Chainsaw Man Watch Order: Season 1, Reze Arc & What's Next",
    seoDescription: "Start Chainsaw Man with Season 1, continue to the Reze Arc movie, then follow direct sequel material. Music videos and promotional shorts are optional.",
    quickAnswer: "Watch Chainsaw Man Season 1 first, continue with The Movie: Reze Arc, then follow the direct sequel entry listed in the current catalog. Ending videos, music clips, and promotional shorts are not required.",
    intro: "Chainsaw Man currently has a short main path: Season 1, then Reze Arc movie-era material as it becomes available.",
    recommendedOrder: [127230, 171627, 204429],
    releaseOrder: [127230, 171627, 198726, 204429],
    optionalEntries: [155884, 156809, 157173, 157349, 159110, 198726],
    skipNotes: "Ending music videos and promotional extras are optional. The main route is the TV series and direct sequel material.",
    legalWatchingNote,
    faq: [
      {
        question: "What should I watch after Chainsaw Man Season 1?",
        answer: "Continue with direct sequel material such as the Reze Arc movie when it is available in your region."
      },
      {
        question: "Are Chainsaw Man music videos part of the story?",
        answer: "No. They are optional extras and should not be treated as main watch-order entries."
      }
    ]
  },
  5114: {
    animeId: 5114,
    updated: "2026-07-14",
    intro: "Brotherhood is the recommended main route for most viewers. The 2003 Fullmetal Alchemist series is an alternate adaptation, not required before Brotherhood.",
    recommendedOrder: [5114],
    releaseOrder: [121, 5114, 6421, 7902, 9135],
    optionalEntries: [121, 6421, 7902, 9135],
    skipNotes: "Watch Brotherhood as the main story. The 2003 series is worth watching as an alternate version later, and Sacred Star of Milos is optional side material.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch Fullmetal Alchemist 2003 before Brotherhood?",
        answer: "Not required. Brotherhood stands on its own and follows the manga more completely."
      },
      {
        question: "Is Sacred Star of Milos required?",
        answer: "No. It is an optional movie and can be watched after Brotherhood if you want more material."
      },
      {
        question: "Which Fullmetal Alchemist should I start with?",
        answer: "Most viewers should start with Fullmetal Alchemist: Brotherhood."
      }
    ]
  },
  11061: {
    animeId: 11061,
    updated: "2026-07-14",
    intro: "Hunter x Hunter (2011) is the cleanest modern route. The 1999 version and OVAs are alternate adaptation material, while the movies are optional.",
    recommendedOrder: [11061],
    releaseOrder: [136, 137, 138, 139, 11061, 13271, 19951],
    optionalEntries: [136, 137, 138, 139, 13271, 19951],
    skipNotes: "The 2011 series is the main recommended route. The 1999 adaptation and films are optional after you know the story.",
    legalWatchingNote,
    faq: [
      {
        question: "Should I watch Hunter x Hunter 1999 or 2011?",
        answer: "Start with Hunter x Hunter (2011) for the broadest modern adaptation."
      },
      {
        question: "Are the Hunter x Hunter movies required?",
        answer: "No. Phantom Rouge and The Last Mission are optional side material."
      },
      {
        question: "Can I skip the old OVAs?",
        answer: "Yes if you are watching the 2011 version."
      }
    ]
  }
};

export const manualSimilarGuidesByAnimeId: Record<number, ManualSimilarGuide> = {
  16498: {
    animeId: 16498,
    updated: "2026-07-29",
    intro: "Use this guide if you want anime with the same pressure as Attack on Titan: survival horror, military stakes, mystery, political reveals, and characters trapped in a collapsing world.",
    whySimilar: "Fans usually look past the titan fights and search for shows with danger, moral compromise, and a world that keeps expanding in uncomfortable ways.",
    bestOverallPick: 116589,
    relatedGuideIds: [113415, 127230, 5114],
    matchAngles: [
      { label: "Closest overall pick", description: "86 EIGHTY-SIX has the strongest mix of military tragedy, class politics, and desperate battlefield survival.", animeIds: [116589] },
      { label: "Best for brutal fantasy politics", description: "Vinland Saga and Fullmetal Alchemist: Brotherhood share long-term conflict, revenge, and shifting moral lines.", animeIds: [101348, 5114] },
      { label: "Best for survival mystery", description: "The Promised Neverland and Kabaneri lean into siege tension and secrets beyond the wall.", animeIds: [101759, 21196] }
    ],
    recommendationNotes: {
      116589: "Closest match for military trauma, class conflict, and young soldiers trapped inside a war machine.",
      101348: "Best if you liked the revenge-to-politics shift and want a grounded historical drama.",
      101759: "Works for viewers who liked the early survival mystery and children fighting a controlled system.",
      21196: "A direct pick for monster-siege tension, train-set action, and WIT Studio spectacle.",
      20829: "Good for post-apocalyptic walls, young fighters, and supernatural enemies."
    },
    faq: [
      { question: "What should I watch after Attack on Titan?", answer: "Try 86 EIGHTY-SIX for the closest military-tragedy match, or Vinland Saga if you want political revenge drama." },
      { question: "Is 86 similar to Attack on Titan?", answer: "Yes. It is not about giants, but it matches the war trauma, class oppression, and desperate-squad feeling." },
      { question: "Is Kabaneri just like Attack on Titan?", answer: "It is closer in surface energy: WIT Studio action, monsters, and siege survival. It is lighter on long-term politics." }
    ]
  },
  101922: {
    animeId: 101922,
    updated: "2026-07-29",
    intro: "This guide is for viewers who want Demon Slayer's clean emotional hook: demons, sword fights, sibling loyalty, tragic villains, and polished action arcs.",
    whySimilar: "The strongest matches keep the story easy to enter while still offering supernatural enemies, training arcs, and visually memorable battles.",
    bestOverallPick: 113415,
    relatedGuideIds: [113415, 20, 21459],
    matchAngles: [
      { label: "Closest modern battle pick", description: "Jujutsu Kaisen is the best next stop for stylish supernatural fights and team chemistry.", animeIds: [113415] },
      { label: "Best for sword-era tragedy", description: "Dororo has demons, body horror, and a more historical revenge journey.", animeIds: [101347] },
      { label: "Best long shounen route", description: "Bleach and Black Clover work if you want a larger power-growth adventure.", animeIds: [269, 97940] }
    ],
    recommendationNotes: {
      113415: "Best overall follow-up for supernatural combat, mentor-student teams, and high-energy animation.",
      101347: "A darker, more historical option with demons, sacrifice, and a wandering quest structure.",
      269: "Good if you want sword-based supernatural battles with a much longer shounen structure.",
      97940: "A lighter long-form pick for magic squads, rival growth, and accessible action arcs.",
      104276: "Works for fans who want heroic training and emotional villain confrontations."
    },
    faq: [
      { question: "What should I watch after Demon Slayer?", answer: "Jujutsu Kaisen is the easiest next pick. Dororo is better if you want a darker demon-hunting journey." },
      { question: "Is Jujutsu Kaisen similar to Demon Slayer?", answer: "Yes. Both use supernatural threats and team battles, though Jujutsu Kaisen is more urban and sarcastic." },
      { question: "Is Bleach good after Demon Slayer?", answer: "Yes if you want a longer sword-fighting supernatural series with larger arcs." }
    ]
  },
  113415: {
    animeId: 113415,
    updated: "2026-07-29",
    intro: "Jujutsu Kaisen recommendations should emphasize urban fantasy, curses, team combat, stylish animation, and characters who treat horror with a sharp sense of humor.",
    whySimilar: "Fans often want another show that feels fast, modern, and supernatural without losing strong fights or mentor-student dynamics.",
    bestOverallPick: 127230,
    relatedGuideIds: [101922, 127230, 11061],
    matchAngles: [
      { label: "Closest darker modern pick", description: "Chainsaw Man keeps the demon-hunting job structure but pushes the tone into messier horror comedy.", animeIds: [127230] },
      { label: "Best clean shounen bridge", description: "Demon Slayer and Bleach keep supernatural battles readable and satisfying.", animeIds: [101922, 269] },
      { label: "Best tactical fight pick", description: "Hunter x Hunter works if you liked clever power systems more than simple strength scaling.", animeIds: [11061] }
    ],
    recommendationNotes: {
      127230: "Best if you want modern supernatural action with darker comedy and messy character psychology.",
      101922: "A cleaner, more emotional version of supernatural team battles and monster-hunting arcs.",
      269: "A long supernatural battle series with swords, spirits, training, and escalating enemy factions.",
      11061: "Great for viewers who liked tactical powers and fights built around rules.",
      20623: "A stronger body-horror pick with moral pressure and an alien threat."
    },
    faq: [
      { question: "What should I watch after Jujutsu Kaisen?", answer: "Chainsaw Man is the strongest tonal neighbor, while Demon Slayer is the easiest broader shounen pick." },
      { question: "Is Chainsaw Man similar to Jujutsu Kaisen?", answer: "Yes, especially in supernatural jobs, monster contracts, and MAPPA-style action, though Chainsaw Man is more chaotic." },
      { question: "Is Hunter x Hunter good for Jujutsu Kaisen fans?", answer: "Yes if you like power systems, training, and tactical fight logic." }
    ]
  },
  21: {
    animeId: 21,
    intro: "One Piece fans usually want big adventure, found family, changing islands or worlds, emotional backstories, and a long route where the cast grows over time.",
    whySimilar: "The best matches are not just pirate shows; they are long journeys with strong crews, arcs, rivalries, and a sense that the world is bigger than the current destination.",
    bestOverallPick: 11061,
    relatedGuideIds: [20, 11061, 21459],
    matchAngles: [
      { label: "Closest adventure spirit", description: "Hunter x Hunter has the same sense of arc-by-arc discovery and tactical growth.", animeIds: [11061] },
      { label: "Best long shounen path", description: "Naruto and Dragon Ball give long character-growth routes with iconic rivalries.", animeIds: [20, 223] },
      { label: "Best magic squad energy", description: "Black Clover is useful for viewers who want a modern team adventure with loud optimism.", animeIds: [97940] }
    ],
    recommendationNotes: {
      11061: "Best overall if you want adventure arcs, strange worlds, and clever fights without copying the pirate setup.",
      20: "Good for long-term growth, rivalries, training, and emotional bonds across a large cast.",
      1735: "Works as the sequel-heavy long shounen route after Naruto's foundation.",
      97940: "Best for a newer magic-squad adventure with a cheerful underdog lead.",
      223: "A classic route for adventure, comedy, training, and iconic power progression."
    },
    faq: [
      { question: "What anime is most like One Piece?", answer: "Hunter x Hunter is the best overall match for adventure structure, arc variety, and creative powers." },
      { question: "Is Naruto similar to One Piece?", answer: "Yes in long-form shounen growth and bonds, but Naruto focuses more on ninja villages and rivalries." },
      { question: "Should I watch One Piece movies while catching up?", answer: "Only if you want extras. The TV series is the main story path." }
    ]
  },
  20: {
    animeId: 20,
    intro: "Naruto recommendations work best around underdog growth, mentors, rivalries, training arcs, village politics, and a cast that keeps expanding across a long story.",
    whySimilar: "Fans usually want another show where the lead starts underestimated and grows through bonds, battles, and painful lessons.",
    bestOverallPick: 21459,
    relatedGuideIds: [21, 21459, 113415],
    matchAngles: [
      { label: "Closest modern underdog pick", description: "My Hero Academia rebuilds the school and mentor side of Naruto through superhero training.", animeIds: [21459] },
      { label: "Best long adventure pick", description: "One Piece and Black Clover give the same long shounen commitment and crew growth.", animeIds: [21, 97940] },
      { label: "Best supernatural battle route", description: "Jujutsu Kaisen and Bleach keep the team-combat energy but move into darker threats.", animeIds: [113415, 269] }
    ],
    recommendationNotes: {
      21459: "Best overall if you want training, mentors, classmates, and a clear underdog-to-hero arc.",
      21: "A larger adventure with emotional backstories, crew bonds, and long-term growth.",
      97940: "Strong match for loud underdog energy, rival growth, squads, and magic battles.",
      269: "Good for supernatural fights, swords, mentors, and a long escalation path.",
      113415: "A sharper modern pick for team missions and supernatural combat."
    },
    faq: [
      { question: "What should I watch after Naruto?", answer: "My Hero Academia is the easiest modern bridge. One Piece is better if you want another huge long-term adventure." },
      { question: "Is Black Clover similar to Naruto?", answer: "Yes. It shares underdog rivalry, squads, loud optimism, and power growth." },
      { question: "Is Boruto required after Naruto?", answer: "No. It is sequel-era material, not required if you only want Naruto and Shippuden." }
    ]
  },
  1535: {
    animeId: 1535,
    updated: "2026-07-29",
    intro: "Death Note fans are usually searching for psychological anime with mind games, moral pressure, crime tension, and characters trying to outthink each other.",
    whySimilar: "The best matches keep the suspense intellectual: plans, counterplans, secrets, identity games, and ethical collapse.",
    bestOverallPick: 1575,
    relatedGuideIds: [16498, 127230, 5114],
    matchAngles: [
      { label: "Closest mind-game pick", description: "Code Geass has the strongest strategy-vs-strategy appeal with a charismatic antihero.", animeIds: [1575] },
      { label: "Best crime thriller pick", description: "Monster is slower and more grounded, but it is excellent for moral dread and pursuit tension.", animeIds: [19] },
      { label: "Best compact suspense pick", description: "ERASED and The Promised Neverland are easier short routes for mystery pressure.", animeIds: [21234, 101759] }
    ],
    recommendationNotes: {
      1575: "Best overall if you want a brilliant lead, secret identity, manipulation, and escalating consequences.",
      19: "A slower crime thriller built on morality, pursuit, and psychological pressure.",
      2904: "Continue Code Geass if the strategic antihero angle is what worked for you.",
      101759: "Good for cat-and-mouse suspense and children solving a controlled-system mystery.",
      21234: "A short mystery thriller with crime, trauma, and time-pressure investigation."
    },
    faq: [
      { question: "What anime is closest to Death Note?", answer: "Code Geass is the closest broad recommendation because it shares a brilliant antihero, manipulation, and consequences." },
      { question: "Is Monster like Death Note?", answer: "Yes, but it is slower, more realistic, and more focused on crime-thriller dread than supernatural rules." },
      { question: "Should I watch Death Note: Relight?", answer: "Only as a recap after the TV series." }
    ]
  },
  21459: {
    animeId: 21459,
    intro: "My Hero Academia fans often want hopeful training, ensemble classmates, tournaments, superpowers, mentor figures, and villains who challenge the hero system.",
    whySimilar: "The strongest matches keep the school or squad structure while giving viewers clear power growth and heroic pressure.",
    bestOverallPick: 97940,
    relatedGuideIds: [20, 21, 11061],
    matchAngles: [
      { label: "Closest underdog school energy", description: "Black Clover gives the loud underdog, rival, squad, and power-growth pattern.", animeIds: [97940] },
      { label: "Best superhero contrast", description: "One-Punch Man uses hero society for comedy and satire instead of school progression.", animeIds: [21087] },
      { label: "Best classic training route", description: "Naruto and Hunter x Hunter are stronger if you want mentors, exams, and tactical growth.", animeIds: [20, 11061] }
    ],
    recommendationNotes: {
      97940: "Best overall for underdog growth, rivals, squads, and a clear path from weakness to competence.",
      20: "A classic pick for training, mentorship, rivalries, and emotional power growth.",
      21087: "Good if you liked superhero society but want a comedy-satire angle.",
      11061: "Best if you want exams, training, and smarter fight rules.",
      20755: "Works for school ensemble bonds, mentorship, and a class growing under pressure."
    },
    faq: [
      { question: "What should I watch after My Hero Academia?", answer: "Black Clover is the easiest next pick, while Naruto is the classic underdog-training route." },
      { question: "Is One-Punch Man similar to My Hero Academia?", answer: "It shares hero society, but it is more comedy and satire than school progression." },
      { question: "Is My Hero Academia good for Naruto fans?", answer: "Yes, especially if you like classmates, mentors, and underdog growth." }
    ]
  },
  127230: {
    animeId: 127230,
    intro: "Chainsaw Man recommendations should prioritize messy supernatural jobs, horror comedy, morally damaged leads, devils or monsters, and a tone that can turn funny or brutal quickly.",
    whySimilar: "Fans are usually looking for something less polished and more dangerous than standard battle shounen.",
    bestOverallPick: 105228,
    relatedGuideIds: [113415, 1535, 16498],
    matchAngles: [
      { label: "Closest chaotic horror pick", description: "Dorohedoro has the best mix of grotesque worldbuilding, comedy, violence, and strange warmth.", animeIds: [105228] },
      { label: "Best modern supernatural job pick", description: "Jujutsu Kaisen is cleaner, but the curse-hunting structure overlaps strongly.", animeIds: [113415] },
      { label: "Best dark emotional pick", description: "Devilman Crybaby goes harder on tragedy, body horror, and apocalyptic collapse.", animeIds: [98460] }
    ],
    recommendationNotes: {
      105228: "Best overall for grotesque comedy, violent weirdness, and a lovable cast inside an ugly world.",
      113415: "Cleaner but highly compatible: supernatural jobs, teams, curses, and intense fights.",
      98460: "Best if you want the darker emotional and body-horror side pushed further.",
      171018: "Good for chaotic supernatural comedy with explosive modern energy.",
      145064: "A natural continuation for MAPPA-style urban supernatural action."
    },
    faq: [
      { question: "What anime is most like Chainsaw Man?", answer: "Dorohedoro is the best tonal neighbor. Jujutsu Kaisen is the cleaner mainstream bridge." },
      { question: "Is Devilman Crybaby similar to Chainsaw Man?", answer: "Yes in horror and tragedy, but Devilman Crybaby is more apocalyptic and emotionally punishing." },
      { question: "Is Chainsaw Man like Jujutsu Kaisen?", answer: "Yes in supernatural action jobs, though Chainsaw Man is messier, darker, and stranger." }
    ]
  },
  5114: {
    animeId: 5114,
    intro: "Fullmetal Alchemist: Brotherhood recommendations should focus on complete adventure drama: family bonds, moral cost, military conspiracy, philosophy, and a story that actually ends.",
    whySimilar: "Fans usually want strong plotting and emotional payoff rather than another endless power ladder.",
    bestOverallPick: 11061,
    relatedGuideIds: [11061, 16498, 21],
    matchAngles: [
      { label: "Closest adventure quality", description: "Hunter x Hunter matches the thoughtful power system and arc variety, though it is less tightly closed.", animeIds: [11061] },
      { label: "Best war and moral cost", description: "Attack on Titan Season 3 Part 2 and Vinland Saga work if you want painful conflict and ideology.", animeIds: [104578, 101348] },
      { label: "Best older action-fantasy route", description: "Soul Eater and D.Gray-man are useful if you want supernatural teams and stylized fights.", animeIds: [3588, 1482] }
    ],
    recommendationNotes: {
      11061: "Best overall for smart fights, emotional arcs, and adventure that changes shape over time.",
      104578: "Strong match for military conspiracy, cost of war, and major plot payoffs.",
      3588: "Good for a stylized supernatural school-team angle.",
      1482: "Works for darker shounen fantasy, organizations, and tragic enemies.",
      21: "A much longer adventure, but strong on found family and emotional backstories."
    },
    faq: [
      { question: "What should I watch after Fullmetal Alchemist: Brotherhood?", answer: "Hunter x Hunter is the best broad next pick. Vinland Saga is better if you want heavier moral drama." },
      { question: "Is Fullmetal Alchemist 2003 required before Brotherhood?", answer: "No. Treat it as an alternate adaptation to watch later." },
      { question: "Is Attack on Titan similar to FMA Brotherhood?", answer: "It overlaps in war, conspiracy, and moral cost, but Attack on Titan is darker and more thriller-driven." }
    ]
  },
  11061: {
    animeId: 11061,
    intro: "Hunter x Hunter fans usually want tactical power systems, changing arc formats, adventure, tests, morally strange enemies, and a story that can become darker without warning.",
    whySimilar: "The best matches reward viewers who like clever rules, long-term character growth, and fights won by thinking rather than raw power.",
    bestOverallPick: 5114,
    relatedGuideIds: [21, 5114, 113415],
    matchAngles: [
      { label: "Closest complete adventure", description: "Fullmetal Alchemist: Brotherhood has the best mix of adventure, moral stakes, and careful plotting.", animeIds: [5114] },
      { label: "Best long exploration pick", description: "One Piece has the stronger sense of enormous world travel and found-family momentum.", animeIds: [21] },
      { label: "Best battle-rule route", description: "Yu Yu Hakusho and Jujutsu Kaisen are useful if fights and supernatural rules are your priority.", animeIds: [392, 113415] }
    ],
    recommendationNotes: {
      5114: "Best overall if you want smart adventure, strong emotional payoff, and a complete story.",
      21: "Best for long exploration, crews, arcs, and a giant world that keeps opening up.",
      392: "A classic Togashi pick with tournament energy, spirit battles, and character chemistry.",
      113415: "Good modern pick for tactical supernatural fights and team missions.",
      115230: "Useful if you liked tests, towers, factions, and dangerous rule-based progression."
    },
    faq: [
      { question: "What should I watch after Hunter x Hunter?", answer: "Fullmetal Alchemist: Brotherhood is the best complete adventure pick; One Piece is the larger long-form route." },
      { question: "Is Yu Yu Hakusho similar to Hunter x Hunter?", answer: "Yes. It is from the same creator and shares spirit battles, tournaments, and strong character chemistry." },
      { question: "Is One Piece similar to Hunter x Hunter?", answer: "Yes in adventure and arc variety, though One Piece is more comedic and much longer." }
    ]
  },
  20954: {
    animeId: 20954,
    updated: "2026-07-29",
    seoTitle: "Anime Like A Silent Voice: Emotional Stories",
    seoDescription: "Find anime like A Silent Voice about healing, disability, guilt, communication, school trauma, and learning how to reconnect with other people.",
    intro: "The best anime like A Silent Voice are not simply sad romances. They are stories about damaged communication, guilt that lingers after school, disability or isolation, and the difficult work of becoming reachable again.",
    whySimilar: "Viewers usually remember A Silent Voice for its restraint: apologies do not erase harm, loneliness changes how people read a room, and healing happens through awkward choices rather than a single dramatic speech. These picks preserve that emotional patience even when their plots are different.",
    whoShouldWatch: "Use this guide if you want emotionally grounded anime about regret, social anxiety, disability, grief, or young people rebuilding trust. The strongest matches value small changes in behavior as much as major plot turns.",
    beforeStarting: "Several recommendations deal with bullying, illness, grief, or self-harm. Check the tone and content notes before choosing a casual watch, and prefer a finished movie or series when you want a complete emotional arc.",
    bestOverallPick: 113596,
    relatedGuideIds: [21519, 21827, 20665],
    matchAngles: [
      { label: "Closest healing romance", description: "Josee, the Tiger and the Fish combines disability, independence, friction, and affection without treating personal growth as instant or tidy.", animeIds: [113596] },
      { label: "Best emotional movie route", description: "I Want to Eat Your Pancreas and Your Name use a compact film format to turn connection, absence, and missed chances into a complete emotional payoff.", animeIds: [99750, 21519] },
      { label: "Best for learning to communicate", description: "Violet Evergarden and Your lie in April focus on people who struggle to express grief, love, fear, and responsibility directly.", animeIds: [21827, 20665] }
    ],
    recommendationNotes: {
      113596: "Closest overall match for disability, guarded independence, difficult first impressions, and a relationship that changes how both leads face the world.",
      99750: "A compact emotional film about connection under a deadline, with grief and vulnerability at the center rather than melodrama alone.",
      21519: "Best if you want another visually expressive movie about distance, missed communication, memory, and trying to reach one specific person.",
      21827: "A slower healing route about trauma, emotional literacy, and learning what other people mean when words are not enough.",
      20665: "Useful for viewers who responded to school-age pain, guilt, music, and characters who hide distress behind ordinary routines.",
      4181: "A longer and heavier family-drama route where emotional consequences continue after the initial romance has formed.",
      1689: "A quiet choice for viewers who prefer distance, regret, and realism over a reassuring romantic resolution."
    },
    faq: [
      { question: "What anime is most like A Silent Voice?", answer: "Josee, the Tiger and the Fish is the closest overall match for disability, guarded communication, and a relationship that supports difficult personal growth." },
      { question: "Is Your Name similar to A Silent Voice?", answer: "Both are emotional anime films about reaching another person, but Your Name is more fantastical while A Silent Voice is more grounded in guilt and social harm." },
      { question: "What should I watch after A Silent Voice if I want another sad movie?", answer: "Try I Want to Eat Your Pancreas for a direct emotional film, or 5 Centimeters per Second for a quieter and less comforting story about distance." },
      { question: "Are these recommendations only romance anime?", answer: "No. The guide prioritizes healing, communication, grief, and isolation. Romance is present in several picks, but it is not the only matching reason." }
    ]
  },
  13601: {
    animeId: 13601,
    updated: "2026-07-29",
    seoTitle: "Anime Like Psycho-Pass: Dystopian Crime Thrillers",
    seoDescription: "Find anime like Psycho-Pass with dystopian policing, crime investigations, psychological pressure, surveillance, and moral conflict about who controls justice.",
    intro: "Anime like Psycho-Pass should make justice feel unstable. The strongest matches combine investigation, institutional power, surveillance or advanced technology, and characters forced to decide whether a safe system can still be morally wrong.",
    whySimilar: "Psycho-Pass works because the Sibyl System is not just background worldbuilding; it changes every arrest, career, and definition of guilt. These recommendations keep that pressure by turning crime, technology, or authority into a problem the cast cannot solve with action alone.",
    whoShouldWatch: "Use this guide if you want adult crime stories, ideological conflict, investigators under pressure, and science fiction that asks who gets measured, judged, or sacrificed by a supposedly rational system.",
    beforeStarting: "These picks range from procedural mystery to slow psychological drama. Choose PLUTO for the closest balanced route, Monster for grounded pursuit, or Steins;Gate when technological consequences matter more than police procedure.",
    bestOverallPick: 99088,
    relatedGuideIds: [1535, 19, 9253],
    matchAngles: [
      { label: "Closest systemic crime mystery", description: "PLUTO pairs a mature investigation with artificial intelligence, prejudice, political violence, and detectives trying to understand crimes larger than one suspect.", animeIds: [99088] },
      { label: "Best moral pursuit thrillers", description: "Monster and Death Note remove most futuristic machinery but keep the pursuit, ethical compromise, and dangerous certainty of people deciding who deserves judgment.", animeIds: [19, 1535] },
      { label: "Best technology-and-identity route", description: "Steins;Gate and The Ghost in the Shell move the match toward technological consequences, altered identity, and institutions that cannot fully control what they created.", animeIds: [9253, 177699] }
    ],
    recommendationNotes: {
      99088: "Closest overall pick for an adult science-fiction investigation shaped by artificial intelligence, political power, prejudice, and the cost of defining a person.",
      9253: "Best when you want technology to create the moral trap, with psychological pressure increasing as the lead understands the consequences.",
      21127: "Continue here after Steins;Gate if the damaged-lead and consequence-heavy side of the comparison matters most.",
      1535: "A faster cat-and-mouse route about judgment, secret power, and the corruption that follows when one person believes the system is unnecessary.",
      19: "A grounded and patient crime thriller about pursuit, responsibility, and whether saving one life can create an unbearable moral debt.",
      177699: "A direct cybernetic identity pick for viewers interested in surveillance, personhood, public security, and the boundary between human and system.",
      21803: "A more stylized closed-circle mystery for viewers who want deduction, eccentric dialogue, and psychological games over dystopian policing."
    },
    faq: [
      { question: "What anime is most like Psycho-Pass?", answer: "PLUTO is the strongest overall match in this catalog because it combines mature crime investigation, advanced technology, political violence, and questions about personhood." },
      { question: "Is Death Note similar to Psycho-Pass?", answer: "Yes in moral judgment and psychological pursuit, but Death Note centers on an individual secret power while Psycho-Pass centers on an institutional system." },
      { question: "Is Monster good for Psycho-Pass fans?", answer: "Yes if you can trade futuristic policing for a slower, grounded pursuit story with equally serious questions about guilt and responsibility." },
      { question: "Are all Psycho-Pass alternatives cyberpunk?", answer: "No. This guide prioritizes investigation, authority, moral pressure, and systems of judgment. Some matches are cyberpunk; others reach the same tension through crime drama." }
    ]
  }
};

const blockedFormats = new Set(["MANGA", "NOVEL", "ONE_SHOT", "LIGHT_NOVEL", "MUSIC"]);
const blockedRelations = new Set(["SOURCE", "CHARACTER", "OTHER"]);
const recapRelations = new Set(["SUMMARY", "ALTERNATIVE"]);

export function manualSimilarGuideFor(animeId: number): ManualSimilarGuide | undefined {
  return manualSimilarGuidesByAnimeId[animeId];
}

export function manualWatchOrderFor(animeId: number): ManualWatchOrderEntry | undefined {
  return manualWatchOrderByAnimeId[animeId];
}

export function manualEditorialFor(animeId: number): ManualEditorialEntry | undefined {
  return manualEditorialByAnimeId[animeId];
}

export function isAnimeWatchOrderEntry(entry: RelatedAnime): boolean {
  const format = String(entry.format || "").toUpperCase();
  const relation = String(entry.relationType || "").toUpperCase();
  return !blockedFormats.has(format) && !blockedRelations.has(relation);
}

export function watchOrderQualityEntries(guide: WatchOrderGuide): RelatedAnime[] {
  return guide.entries.filter(isAnimeWatchOrderEntry);
}

export function isQualityWatchOrderGuide(guide: WatchOrderGuide): boolean {
  const manual = manualWatchOrderByAnimeId[guide.rootAnimeId];
  const usable = watchOrderQualityEntries(guide);
  const manualCount = manual
    ? uniqueIds([...manual.recommendedOrder, ...manual.releaseOrder, ...manual.optionalEntries]).filter((id) => Boolean(animeById(id))).length
    : 0;
  const count = Math.max(usable.length, manualCount);
  const hasMainStory = usable.some((entry) => !recapRelations.has(String(entry.relationType || "").toUpperCase()));

  return count >= 3 && hasMainStory;
}

export function qualityWatchOrderGuides(guides: WatchOrderGuide[] = []): WatchOrderGuide[] {
  const seen = new Set<string>();
  const curated = manualFeaturedAnimeIds
    .map((id) => watchOrderFor(id))
    .filter((guide): guide is WatchOrderGuide => {
      if (!guide) return false;
      return isQualityWatchOrderGuide(guide);
    });
  const rest = guides.filter(isQualityWatchOrderGuide);

  return [...curated, ...rest].filter((guide) => {
    if (seen.has(guide.slug)) return false;
    seen.add(guide.slug);
    return true;
  });
}

export function qualityWatchOrderFor(animeId: number): WatchOrderGuide | undefined {
  const guide = watchOrderFor(animeId);
  return guide && isQualityWatchOrderGuide(guide) ? guide : undefined;
}

export function entriesForManualOrder(ids: number[], guide: WatchOrderGuide | undefined, fallbackRelationType = "RELATED"): RelatedAnime[] {
  return uniqueIds(ids)
    .map((id) => guide?.entries.find((entry) => entry.animeId === id) || relatedEntryFromAnime(animeById(id), fallbackRelationType))
    .filter((entry): entry is RelatedAnime => {
      if (!entry) return false;
      return isAnimeWatchOrderEntry(entry);
    });
}

function relatedEntryFromAnime(anime: AnimeSummary | undefined, relationType: string): RelatedAnime | undefined {
  if (!anime) return undefined;
  return {
    animeId: anime.id,
    title: displayTitle(anime),
    slug: anime.slug,
    relationType,
    format: anime.format,
    status: anime.status,
    season: anime.season,
    seasonYear: anime.seasonYear,
    episodes: anime.episodes,
    averageScore: anime.averageScore,
    popularity: anime.popularity,
    startDate: anime.startDate,
    coverImage: anime.coverImage?.large || anime.coverImage?.extraLarge || "/og-default.svg",
    siteUrl: anime.siteUrl || undefined
  };
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids.filter(Boolean))];
}
