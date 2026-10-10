/**
 * Golden corpus for creative packaging — failure *classes*, not one-off screenshots.
 * Each case asserts the pipeline understands the topic without boilerplate pollution.
 */

export type PackagingCorpusCase = {
  id: string
  /** Failure class this guards */
  class:
    | 'youtube-wrapper'
    | 'music'
    | 'auto-dealer'
    | 'finance'
    | 'tech-vs'
    | 'gaming'
    | 'tutorial'
    | 'story'
    | 'myth'
    | 'short'
    | 'long'
    | 'emoji-noise'
    | 'tamil-mixed'
  /** User paste or oEmbed title */
  topic: string
  /** Optional poisoned wrapper (old sceneBrief bug) */
  poisoned?: string
  /** Content tokens that must appear in headlines or visuals */
  mustKeep: string[]
  /** Tokens that must never appear in packaging output */
  mustNever?: string[]
  /** Expected kind when detectable */
  expectKind?: string
  /** Visual must match at least one of these (product / scene anchors) */
  visualAnchors?: string[]
}

/** Shared garbage from historical bugs — banned across the whole corpus. */
export const PACKAGING_BANLIST = [
  /TITLED\b/i,
  /High-CTR packaging/i,
  /one clear subject/i,
  /burned-in text/i,
  /^WHAT\s+\w+\s+HIDES$/i,
  /WHY\s+.+\s+MATTERS/i,
  /\bTHAT WORKS\b/i,
  /DON'T MISTAKES/i,
  /YouTube video titled/i,
]

export const PACKAGING_CORPUS: PackagingCorpusCase[] = [
  // —— YouTube wrapper / oEmbed poison ——
  {
    id: 'yt-slavia',
    class: 'youtube-wrapper',
    topic: 'Why did i not book slavia? (My sad skoda story)',
    poisoned:
      'YouTube video titled “Why did i not book slavia? (My sad skoda story)” by tech panda tamil. High-CTR packaging still: one clear subject, dramatic light, empty space for a bold title. Do not invent burned-in text.',
    mustKeep: ['skoda', 'slavia'],
    expectKind: 'tech',
    visualAnchors: ['skoda', 'slavia', 'car', 'sedan', 'automotive'],
  },
  {
    id: 'yt-never-gonna',
    class: 'youtube-wrapper',
    topic: 'Never Gonna Give You Up (Official Video) (4K Remaster)',
    poisoned:
      'YouTube video titled “Never Gonna Give You Up (Official Video) (4K Remaster)” by Rick Astley. High-CTR packaging still: one clear subject.',
    mustKeep: ['never', 'gonna'],
    mustNever: ['titled'],
  },
  {
    id: 'yt-colon-title',
    class: 'youtube-wrapper',
    topic: 'I quit my job: what happened next',
    poisoned:
      'YouTube video titled “I quit my job: what happened next”. High-CTR packaging still: one clear subject, dramatic light.',
    mustKeep: ['quit', 'job'],
    mustNever: ['titled', 'dramatic light'],
  },

  // —— Music ——
  {
    id: 'music-pattamboochi',
    class: 'music',
    topic: 'Vishwanath and sons - pattamboochi song',
    mustKeep: ['pattamboochi'],
    expectKind: 'music',
    visualAnchors: ['pattamboochi', 'singer', 'music', 'tamil'],
  },
  {
    id: 'music-ariana',
    class: 'music',
    topic: 'Ariana Grande - we can\'t be friends (official music video)',
    mustKeep: ['friends', 'ariana'],
    expectKind: 'music',
  },
  {
    id: 'music-tamil-ost',
    class: 'music',
    topic: 'Anirudh - Badass Lyric Video | Leo',
    mustKeep: ['badass', 'anirudh'],
    expectKind: 'music',
  },

  // —— Auto / dealer ——
  {
    id: 'auto-slavia-plain',
    class: 'auto-dealer',
    topic: 'Why did i not book slavia? (My sad skoda story)',
    mustKeep: ['skoda', 'slavia'],
    expectKind: 'tech',
    visualAnchors: ['skoda', 'slavia', 'car', 'sedan', 'automotive'],
  },
  {
    id: 'auto-creta',
    class: 'auto-dealer',
    topic: 'Hyundai Creta vs Kia Seltos 2024 — which should you buy?',
    mustKeep: ['creta', 'seltos'],
    visualAnchors: ['hyundai', 'creta', 'kia', 'car', 'sedan', 'automotive'],
  },
  {
    id: 'auto-dealer-scam',
    class: 'auto-dealer',
    topic: 'Car dealer scam: they took my booking amount',
    mustKeep: ['dealer', 'booking'],
    visualAnchors: ['car', 'dealer', 'sedan', 'automotive', 'showroom'],
  },

  // —— Finance / mistakes ——
  {
    id: 'finance-house',
    class: 'finance',
    topic: '5 mistakes first-time home buyers make',
    mustKeep: ['home', 'buyer'],
    mustNever: ["don't mistakes"],
  },
  {
    id: 'finance-sip',
    class: 'finance',
    topic: 'SIP vs lumpsum — what actually grows wealth',
    mustKeep: ['sip'],
  },

  // —— Tech vs ——
  {
    id: 'tech-iphone-pixel',
    class: 'tech-vs',
    topic: 'iPhone 16 vs Pixel camera test',
    mustKeep: ['iphone', 'pixel'],
    expectKind: 'vs',
    visualAnchors: ['iphone', 'pixel', 'phone', 'camera', 'device'],
  },
  {
    id: 'tech-unbox',
    class: 'tech-vs',
    topic: 'MacBook Air M3 unboxing and first impressions',
    mustKeep: ['macbook'],
    expectKind: 'tech',
  },

  // —— Gaming ——
  {
    id: 'gaming-valorant',
    class: 'gaming',
    topic: 'How I hit Radiant in Valorant with one agent',
    mustKeep: ['valorant', 'radiant'],
    expectKind: 'gaming',
  },
  {
    id: 'gaming-minecraft',
    class: 'gaming',
    topic: 'Minecraft hardcore episode 1 — I almost died',
    mustKeep: ['minecraft'],
    expectKind: 'gaming',
  },

  // —— Tutorial ——
  {
    id: 'tutorial-excel',
    class: 'tutorial',
    topic: 'How to use VLOOKUP in Excel (beginner guide)',
    mustKeep: ['vlookup', 'excel'],
    expectKind: 'tutorial',
  },
  {
    id: 'tutorial-react',
    class: 'tutorial',
    topic: 'Learn React hooks in 15 minutes',
    mustKeep: ['react', 'hooks'],
    expectKind: 'tutorial',
  },

  // —— Story ——
  {
    id: 'story-elephant',
    class: 'story',
    topic: 'elephant fell into a dug well',
    mustKeep: ['elephant', 'well'],
    mustNever: ['fell dug', 'why elephant fell dug matters'],
    visualAnchors: ['elephant', 'well', 'dug'],
  },
  {
    id: 'story-breakup',
    class: 'story',
    topic: 'I broke up with my girlfriend — storytime',
    mustKeep: ['broke'],
    expectKind: 'story',
  },

  // —— Myth / contrarian ——
  {
    id: 'myth-investing',
    class: 'myth',
    topic: 'the truth about investing myths nobody tells you',
    mustKeep: ['invest'],
  },
  {
    id: 'myth-protein',
    class: 'myth',
    topic: 'Protein myths that are making you fat',
    mustKeep: ['protein'],
  },

  // —— Edge shapes ——
  {
    id: 'short-yes',
    class: 'short',
    topic: 'I quit',
    mustKeep: ['quit'],
  },
  {
    id: 'long-clickbait',
    class: 'long',
    topic:
      'I spent 30 days eating only street food in Chennai and this is what happened to my health and wallet',
    mustKeep: ['chennai', 'street'],
  },
  {
    id: 'emoji-noise',
    class: 'emoji-noise',
    topic: 'Why did i not book slavia? (My sad skoda story) ❤️🔥😭',
    mustKeep: ['skoda', 'slavia'],
    visualAnchors: ['skoda', 'slavia', 'car', 'automotive'],
  },
  {
    id: 'tamil-mixed',
    class: 'tamil-mixed',
    topic: 'Vadivelu comedy scenes that still hit in 2024',
    mustKeep: ['vadivelu'],
  },
  {
    id: 'all-caps',
    class: 'long',
    topic: 'THIS BANK LOAN WILL RUIN YOUR LIFE',
    mustKeep: ['bank', 'loan'],
  },
  {
    id: 'question-only',
    class: 'short',
    topic: 'Is remote work dead?',
    mustKeep: ['remote'],
  },
]
