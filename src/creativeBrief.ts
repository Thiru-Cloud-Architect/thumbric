/**
 * Phase 1A — creative strategies for thumbnails.
 * Separates content understanding → strategy → image prompt → editable title.
 * Deterministic (no LLM) so free tier always works.
 */

export type CreativeStrategyId =
  | 'warning'
  | 'curiosity'
  | 'outcome'
  | 'contrarian'
  | 'emotion'
  | 'authority'
  | 'transformation'
  | 'reveal'

export type TopicKind =
  | 'music'
  | 'gaming'
  | 'finance'
  | 'tech'
  | 'tutorial'
  | 'vs'
  | 'story'
  | 'general'

export type ParsedTopic = {
  raw: string
  kind: TopicKind
  /** Artist, creator, product, or main noun phrase */
  subject: string
  /** Song title, subtitle, or secondary phrase */
  detail: string
  keys: string[]
  /** Short phrase safe for mobile headlines */
  hookPhrase: string
}

export type CreativeConcept = {
  id: CreativeStrategyId
  /** Short card title shown to the user */
  strategy: string
  /** Why this packaging works */
  why: string
  emotion: string
  /** Visual direction for the image model (no title text) */
  visual: string
  /** Editable canvas headline */
  headline: string
  /** Optional second line */
  subheadline?: string
  placement: 'left' | 'center' | 'right'
}

export type CreativeBrief = {
  topic: string
  audience: string
  promise: string
  kind: TopicKind
  parsed: ParsedTopic
  concepts: CreativeConcept[]
}

/** Words dropped when building keyword lists — NOT used to scramble titles. */
const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'my',
  'your',
  'our',
  'is',
  'are',
  'about',
  'video',
  'this',
  'that',
  'when',
  'from',
  'how',
  'why',
  'what',
  'i',
  'me',
  'we',
  'you',
  'it',
  'as',
  'at',
  'by',
  'song',
  'lyrics',
  'lyric',
  'official',
  'full',
  'hd',
  '4k',
  'please',
  'make',
  'create',
  'thumbnail',
  'youtube',
  'titled',
  'title',
  'packaging',
  'still',
  'clear',
  'subject',
  'dramatic',
  'empty',
  'space',
  'bold',
  'invent',
  'burned-in',
  'burned',
  'text',
])

/** Keep short connectors so titles stay grammatical ("fell into a dug well"). */
const KEEP_CONNECTORS = new Set([
  'a',
  'an',
  'the',
  'into',
  'onto',
  'from',
  'with',
  'without',
  'vs',
  'versus',
  'and',
  'or',
  'of',
  'in',
  'on',
  'for',
  'to',
])

function cleanTopic(raw: string) {
  let t = raw.trim()

  // Prefer the real YouTube title if a wrapper like: titled "Why did i not book…"
  const titledQuote =
    t.match(/\btitled\s+[“"'](.+?)[”"']/i) ||
    t.match(/[“"](.+?)[”"]/)
  if (titledQuote?.[1] && titledQuote[1].trim().length >= 8) {
    t = titledQuote[1].trim()
  }

  // Strip leftover packaging instructions that must never become the topic.
  t = t.replace(/\.\s*High-CTR packaging[\s\S]*$/i, '')
  t = t.replace(/^YouTube video\b[^.]*\.\s*/i, '')
  t = t.replace(/\s+by\s+[^.]+$/i, (tail) => {
    // Keep "by Artist" only when the left side is short (music). Long tails are channel spam.
    return t.length - tail.length < 48 ? tail : ''
  })

  return t
    .replace(/^(cinematic\s+)?(still|shot|image|photo|photograph|thumbnail)\s+that\s+matches\s*:?\s*/i, '')
    .replace(/^(my\s+video\s+is\s+about\s+|this\s+video\s+is\s+about\s+|i\s+made\s+a\s+video\s+about\s+)/i, '')
    .replace(/^(generate|make|create)\s+(me\s+)?(a\s+)?(thumbnail|cover|image)\s+(for|of|about)\s+/i, '')
    // Drop trailing emoji / decorative symbols so "(My sad skoda story) ❤️" still parses.
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCasePhrase(value: string, maxWords = 5) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords)
    .map((w) => w.replace(/^\w/, (c) => c.toUpperCase()))
    .join(' ')
}

function clipHeadline(value: string, max = 32) {
  let cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  // Drop optional articles first so endings like WELL survive the mobile cap.
  cleaned = cleaned.replace(/\s+\b(A|AN|THE)\b\s+/gi, ' ').replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max).replace(/\s+\S*$/, '').trim() || cleaned.slice(0, max)
}

/**
 * Mobile title from the user's words in order — never a bag-of-keywords scramble.
 * "elephant fell into a dug well" → "ELEPHANT FELL INTO DUG WELL"
 * not "ELEPHANT FELL DUG".
 */
export function naturalTitle(rawTopic: string, maxChars = 32) {
  let t = cleanTopic(rawTopic)
  t = t.replace(/^(why|how|what|when|who)\s+/i, '')
  const words = t
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => {
      const lower = w.toLowerCase().replace(/[^a-z0-9'-]/g, '')
      if (!lower) return false
      if (KEEP_CONNECTORS.has(lower)) return true
      if (STOP.has(lower)) return false
      return true
    })
  // Drop leading connectors ("into a …")
  while (words.length && KEEP_CONNECTORS.has(words[0]!.toLowerCase().replace(/[^a-z0-9'-]/g, ''))) {
    words.shift()
  }
  const phrase = words.join(' ') || cleanTopic(rawTopic)
  return clipHeadline(phrase.toUpperCase(), maxChars)
}

function subjectFromNatural(title: string) {
  const words = title
    .split(/\s+/)
    .filter((w) => {
      const lower = w.toLowerCase()
      return lower.length > 2 && !KEEP_CONNECTORS.has(lower) && !STOP.has(lower)
    })
  return titleCasePhrase(words.slice(0, 2).join(' '), 2) || titleCasePhrase(title, 2)
}

function isAutoProductTopic(topic: string) {
  return /\b(car|cars|skoda|slavia|kushaq|kodiaq|dealer|dealership|tesla|bmw|audi|hyundai|toyota|honda|suzuki|vehicle|test\s*drive|booking|booked|emi|showroom)\b/i.test(
    topic,
  )
}

function detectKind(topic: string): TopicKind {
  const t = topic.toLowerCase()
  if (
    /\b(song|songs|lyric|lyrics|music|album|melody|cover|singer|rap|ost|soundtrack|mv|karaoke|pattamboochi|gaana|melody)\b/.test(
      t,
    )
  ) {
    return 'music'
  }
  if (/\b(vs|versus|compared|comparison)\b/.test(t)) return 'vs'
  if (/\b(gamer|gaming|ranked|fps|minecraft|fortnite|valorant)\b/.test(t)) return 'gaming'
  if (/\b(invest|stock|crypto|mortgage|loan)\b/.test(t) && !isAutoProductTopic(t)) return 'finance'
  // Cars / booking / dealer reviews are product-tech, not "sad story → face close-up".
  if (
    isAutoProductTopic(t) ||
    /\b(iphone|android|ai|coding|developer|gadget|review|unbox|scam|dealer)\b/.test(t)
  ) {
    return 'tech'
  }
  if (/\b(how to|tutorial|guide|learn|course|tips)\b/.test(t)) return 'tutorial'
  if (/\b(storytime|relationship|couple|broke up|love story)\b/.test(t)) return 'story'
  // "sad skoda story" is still a product story — handled above via auto detect.
  if (/\b(story)\b/.test(t) && !isAutoProductTopic(t)) return 'story'
  return 'general'
}

/**
 * Split "Artist - Song title" only. Never split packaging boilerplate on ":" —
 * that produced subject="YouTube video titled…" detail="one clear subject…".
 */
function splitArtistTitle(topic: string): { subject: string; detail: string } | null {
  const match = topic.match(/^(.{2,42}?)\s*[-–—|]\s+(.+)$/)
  if (!match) return null
  const subject = match[1]!.trim()
  const detail = match[2]!
    .trim()
    .replace(/\b(official\s+)?(video|audio|lyric\s+video|lyrics?|song|full\s+song|hd|4k)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (subject.length < 2 || detail.length < 2) return null
  // Reject sentence-like left sides (questions, long clauses).
  if (/[?]/.test(subject)) return null
  if (subject.split(/\s+/).length > 6) return null
  if (/\b(titled|packaging|youtube video)\b/i.test(subject)) return null
  return { subject, detail }
}

/** Pull "(My sad skoda story)" style subtitles out of YouTube titles. */
function extractParenDetail(topic: string): { core: string; detail: string } {
  const match = topic.match(/^(.*?)\s*[\-(]\s*([^)\]]+)[)\]]\s*$/u)
  if (!match) return { core: topic, detail: '' }
  const core = match[1]!.trim()
  const detail = match[2]!.trim()
  if (core.length < 4 || detail.length < 3) return { core: topic, detail: '' }
  return { core, detail }
}

export function parseTopic(rawTopic: string): ParsedTopic {
  const raw = cleanTopic(rawTopic) || 'my YouTube video'
  const kind = detectKind(raw)
  const split = splitArtistTitle(raw)
  const paren = extractParenDetail(raw)
  const keys = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s$-']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w) && !KEEP_CONNECTORS.has(w))
    .slice(0, 8)

  if (split) {
    const hookPhrase =
      kind === 'music'
        ? titleCasePhrase(split.detail, 4)
        : titleCasePhrase(split.detail || split.subject, 5)
    return {
      raw,
      kind,
      subject: titleCasePhrase(split.subject, 5),
      detail: titleCasePhrase(split.detail, 6),
      keys,
      hookPhrase: hookPhrase || titleCasePhrase(split.subject, 3),
    }
  }

  // "Why did i not book slavia? (My sad skoda story)" → core + story subtitle
  if (paren.detail) {
    const coreTitle = naturalTitle(paren.core, 32)
    const detailTitle = titleCasePhrase(paren.detail, 6)
    return {
      raw,
      kind,
      subject: subjectFromNatural(coreTitle),
      detail: detailTitle,
      keys,
      hookPhrase: detailTitle || titleCasePhrase(coreTitle.toLowerCase(), 6),
    }
  }

  const title = naturalTitle(raw, 36)
  const hookPhrase = titleCasePhrase(title.toLowerCase(), 6) || 'This Video'
  return {
    raw,
    kind,
    subject: subjectFromNatural(title),
    detail: '',
    keys,
    hookPhrase,
  }
}

function guessAudience(parsed: ParsedTopic) {
  const t = parsed.raw.toLowerCase()
  if (parsed.kind === 'music') {
    if (/\b(tamil|kollywood|vadivelu|ilayaraja|arr|anirudh)\b/.test(t)) {
      return 'Tamil music & cinema fans'
    }
    return `Fans of ${parsed.subject || 'this artist'}`
  }
  if (parsed.kind === 'gaming') return 'Gamers who want better results'
  if (parsed.kind === 'finance') return 'People making money decisions'
  if (parsed.kind === 'tech') return 'Tech-curious viewers comparing options'
  if (parsed.kind === 'tutorial') return 'Beginners who want a clear next step'
  if (/\b(beginner|first.?time|new to|starter)\b/.test(t)) return 'Beginners learning this for the first time'
  if (parsed.keys[0]) return `Viewers searching for ${parsed.keys.slice(0, 2).join(' / ')}`
  return 'Curious YouTube viewers'
}

function guessPromise(parsed: ParsedTopic) {
  if (parsed.kind === 'music') {
    return parsed.detail
      ? `Feel the full energy of ${parsed.detail}`
      : `Hear ${parsed.subject} at full emotional volume`
  }
  const t = parsed.raw.toLowerCase()
  if (/\b(mistake|mistakes|avoid|don't|dont|wrong)\b/.test(t)) return 'Avoid costly mistakes'
  if (parsed.kind === 'vs') return 'See which option actually wins'
  if (/\b(secret|nobody|lied|truth)\b/.test(t)) return 'Hear what others skip'
  if (parsed.kind === 'tutorial') return 'Get a clear next step'
  if (parsed.hookPhrase) return `Get clarity on ${parsed.hookPhrase}`
  return 'Learn something that changes the click'
}

/** CTR-safe visual recipe shared across strategies. */
function wowFrame(subjectBlock: string, mood: string, placement: CreativeConcept['placement']) {
  const titleSpace =
    placement === 'left'
      ? 'keep the right third clean for a bold title'
      : placement === 'right'
        ? 'keep the left third clean for a bold title'
        : 'keep the lower third clean for a bold title'
  return [
    'CTR YouTube thumbnail photograph, 1280x720 energy',
    'ONE hero subject filling ~55-65% of the frame, sharp eyes, readable on a phone tile',
    subjectBlock,
    mood,
    titleSpace,
    'cinematic key light, rim light, rich contrast, shallow depth of field',
    'single full-bleed photo — never a multi-panel layout, grid, or split frame',
    'no text, no letters, no logos, no watermarks',
  ].join(', ')
}

type StrategyFactory = (parsed: ParsedTopic) => CreativeConcept

/** Extra visual motifs from song titles (e.g. Tamil "pattamboochi" = butterfly). */
function musicMotif(p: ParsedTopic) {
  const blob = `${p.detail} ${p.raw}`.toLowerCase()
  if (/pattamboochi|butterfly/.test(blob)) {
    return 'romantic Tamil lyric-video mood with a subtle glowing butterfly motif near the hero (bokeh or jewelry), soft night color'
  }
  if (/\b(rain|mazhai|kaatre)\b/.test(blob)) return 'gentle rain + reflective night streets, wet light streaks'
  if (/\b(love|kadhal|romantic)\b/.test(blob)) return 'warm romantic couple or longing close-up, golden fill light'
  return 'premium South-Indian / Tamil film-song atmosphere'
}

function musicFactories(): Partial<Record<CreativeStrategyId, StrategyFactory>> {
  return {
    emotion: (p) => ({
      id: 'emotion',
      strategy: 'The Emotion',
      why: 'Face-forward feeling sells music clicks on mobile.',
      emotion: 'intensity',
      visual: wowFrame(
        `expressive South-Asian / Tamil cinema-style singer or lead in an emotional performance moment for the song "${p.detail || p.raw}" by ${p.subject}, mic or stage haze optional, wardrobe with rich color, ${musicMotif(p)}`,
        'passionate eyes to camera, tear-catch light, concert-cinematic grade',
        'right',
      ),
      headline: clipHeadline((p.detail || p.hookPhrase).toUpperCase(), 22),
      subheadline: p.subject ? clipHeadline(p.subject.toUpperCase(), 24) : 'FULL SONG',
      placement: 'right',
    }),
    curiosity: (p) => ({
      id: 'curiosity',
      strategy: 'The Curiosity Gap',
      why: 'Teases the song without spoiling the vibe — strong for new releases.',
      emotion: 'curiosity',
      visual: wowFrame(
        `mysterious but warm cinematic still inspired by "${p.detail || p.raw}" from ${p.subject}, romantic music-video framing, one clear hero, ${musicMotif(p)}`,
        'half-lit face or couple moment, intrigue without horror',
        'left',
      ),
      headline: clipHeadline((p.detail || p.hookPhrase).toUpperCase(), 22),
      subheadline: 'OUT NOW',
      placement: 'left',
    }),
    outcome: (p) => ({
      id: 'outcome',
      strategy: 'The Outcome',
      why: 'Leads with the song title people will remember in browse.',
      emotion: 'desire',
      visual: wowFrame(
        `aspirational music-video hero still for "${p.detail || p.raw}" by ${p.subject}, vibrant costume color, stage backlight or golden hour, ${musicMotif(p)}`,
        'celebration / catharsis mood, premium film still',
        'left',
      ),
      headline: clipHeadline((p.detail || p.hookPhrase).toUpperCase(), 22),
      subheadline: 'MUST HEAR',
      placement: 'left',
    }),
    authority: (p) => ({
      id: 'authority',
      strategy: 'The Authority',
      why: 'Positions the artist/channel as the definitive listen.',
      emotion: 'trust',
      visual: wowFrame(
        `confident lead performer portrait for ${p.subject}, clean studio or stage light, premium still tied to "${p.detail || 'the song'}", ${musicMotif(p)}`,
        'direct eye contact, calm power, sharp grooming',
        'left',
      ),
      headline: clipHeadline(p.subject.toUpperCase(), 24),
      subheadline: clipHeadline((p.detail || 'OFFICIAL').toUpperCase(), 20),
      placement: 'left',
    }),
    reveal: (p) => ({
      id: 'reveal',
      strategy: 'The Reveal',
      why: 'Makes the track feel like a must-click premiere.',
      emotion: 'anticipation',
      visual: wowFrame(
        `spotlight premiere moment for "${p.detail || p.raw}" by ${p.subject}, one hero figure stepping into light, ${musicMotif(p)}`,
        'launch-night energy, high contrast',
        'left',
      ),
      headline: 'NEW DROP',
      subheadline: clipHeadline((p.detail || p.hookPhrase).toUpperCase(), 18),
      placement: 'left',
    }),
    transformation: (p) => ({
      id: 'transformation',
      strategy: 'Before → After',
      why: 'Suggests an emotional arc — classic for romantic tracks.',
      emotion: 'hope',
      visual: wowFrame(
        `single emotional still suggesting a love-story turn in "${p.detail || p.raw}" by ${p.subject}, softer grade, hopeful eyes, ${musicMotif(p)}`,
        'tender cinematic light — one frame only',
        'center',
      ),
      headline: 'FROM SILENCE',
      subheadline: 'TO THIS',
      placement: 'center',
    }),
  }
}

/** Concrete nouns/verbs from the topic for image prompts (order preserved). */
function visualSubject(p: ParsedTopic) {
  const line = naturalTitle(p.raw, 48).toLowerCase()
  return line || p.raw
}

function productVisualBlock(p: ParsedTopic) {
  const topic = visualSubject(p)
  if (isAutoProductTopic(p.raw)) {
    const model = /\b(slavia|kushaq|kodiaq|swift|creta|nexon|city|virtus|venue)\b/i.exec(p.raw)?.[1]
    const brand = /\b(skoda|hyundai|tata|honda|maruti|suzuki|toyota|kia|mg)\b/i.exec(p.raw)?.[1]
    const car = [brand, model].filter(Boolean).join(' ') || 'sedan car'
    return `real ${car} as the hero product filling the frame, showroom or street, photoreal automotive photography about ${topic}, optional disappointed buyer reacting beside the car — never a face-only crop`
  }
  if (/\b(iphone|android|phone|laptop|gadget|camera)\b/i.test(p.raw)) {
    return `hero product still of the device in ${topic}, hand-scale, photoreal, optional creator reaction in the same frame`
  }
  return `scene that clearly depicts ${topic}, one hero, photoreal`
}

const GENERAL_FACTORIES: Record<CreativeStrategyId, StrategyFactory> = {
  warning: (p) => {
    const storyHook = p.detail ? clipHeadline(p.detail.toUpperCase(), 28) : naturalTitle(p.raw, 24)
    const core = naturalTitle(p.raw, 24)
    const scam = /\b(scam|dealer|money|refund|book|booking)\b/i.test(p.raw)
    return {
      id: 'warning',
      strategy: 'The Warning',
      why: 'Creates urgency — viewers pause before they make a mistake.',
      emotion: 'fear',
      visual: wowFrame(
        `${productVisualBlock(p)}, urgent documentary energy, rejected-vs-chosen tension without painting letters or icons`,
        'red-rim urgency light, high contrast',
        'left',
      ),
      headline: scam ? 'DEALER SCAM?' : 'AVOID THIS',
      subheadline: scam ? storyHook || core : clipHeadline(core, 22),
      placement: 'left',
    }
  },
  curiosity: (p) => {
    const storyHook = p.detail ? clipHeadline(p.detail.toUpperCase(), 28) : ''
    const title = storyHook || naturalTitle(p.raw, 30)
    const vs = p.kind === 'vs' || /\bvs\.?\b|versus/i.test(p.raw)
    const money = /\b(money|refund|book|booking|emi|dealer)\b/i.test(p.raw)
    return {
      id: 'curiosity',
      strategy: 'The Curiosity Gap',
      why: 'Puts the real story up front, then teases the missing piece.',
      emotion: 'curiosity',
      visual: wowFrame(
        `${productVisualBlock(p)}, intrigue without spoiling the ending`,
        'shallow depth of field, moody key light',
        'left',
      ),
      headline: title,
      subheadline: vs ? 'WHO WINS?' : money ? 'MONEY BACK?' : 'WHAT HAPPENED?',
      placement: 'left',
    }
  },
  outcome: (p) => {
    const storyHook = p.detail ? clipHeadline(p.detail.toUpperCase(), 28) : naturalTitle(p.raw, 28)
    const rescue = /\b(rescue|saved|survive|win|won|escaped?)\b/i.test(p.raw)
    const money = /\b(money|refund|book|booking)\b/i.test(p.raw)
    return {
      id: 'outcome',
      strategy: 'The Outcome',
      why: 'Sells the result viewers came for — readable on a phone tile.',
      emotion: 'desire',
      visual: wowFrame(
        `${productVisualBlock(p)}, ${
          money ? 'refund / resolution energy' : rescue ? 'relief and rescue energy' : 'aftermath energy'
        }`,
        'brighter premium light, clean background',
        'right',
      ),
      headline: money ? 'GOT MONEY BACK?' : rescue ? 'THEY MADE IT' : 'THE REAL ENDING',
      subheadline: clipHeadline(storyHook, 28),
      placement: 'right',
    }
  },
  contrarian: (p) => {
    const storyHook = p.detail ? clipHeadline(p.detail.toUpperCase(), 28) : naturalTitle(p.raw, 28)
    return {
      id: 'contrarian',
      strategy: 'The Contrarian',
      why: 'Challenges the obvious take — spikes curiosity CTR.',
      emotion: 'surprise',
      visual: wowFrame(
        `${productVisualBlock(p)}, unexpected angle, subject or product in disbelief framing`,
        'cinematic grade, single frame',
        'center',
      ),
      headline: storyHook,
      subheadline: 'NOT THE STORY',
      placement: 'center',
    }
  },
  emotion: (p) => {
    const storyHook = p.detail ? clipHeadline(p.detail.toUpperCase(), 28) : naturalTitle(p.raw, 24)
    const product = isAutoProductTopic(p.raw) || /\b(iphone|gadget|review)\b/i.test(p.raw)
    return {
      id: 'emotion',
      strategy: 'The Emotion',
      why: product
        ? 'Creator reaction with the product visible — not a random face crop.'
        : 'Face-forward reaction that reads as a tiny phone tile.',
      emotion: 'intensity',
      visual: wowFrame(
        product
          ? `${productVisualBlock(p)}, disappointed or intense creator face readable on mobile`
          : `expressive human face reacting to ${visualSubject(p)}, close-up catchlights, scene context in background bokeh`,
        'emotional intensity, soft bokeh',
        'right',
      ),
      headline: storyHook,
      subheadline: 'WATCH THIS',
      placement: 'right',
    }
  },
  authority: (p) => {
    const title = naturalTitle(p.raw, 24)
    return {
      id: 'authority',
      strategy: 'The Authority',
      why: 'Positions you as the guide who already figured it out.',
      emotion: 'trust',
      visual: wowFrame(
        `${productVisualBlock(p)}, confident creator or expert framing, topic props visible`,
        'premium still, calm negative space for type',
        'left',
      ),
      headline: title,
      subheadline: 'EXPLAINED',
      placement: 'left',
    }
  },
  transformation: (p) => {
    const title = naturalTitle(p.raw, 20)
    return {
      id: 'transformation',
      strategy: 'Before → After',
      why: 'Shows change — classic YouTube packaging for tutorials and stories.',
      emotion: 'hope',
      visual: wowFrame(
        `${productVisualBlock(p)}, single cinematic still suggesting before/after change`,
        'hopeful grade — one frame only',
        'center',
      ),
      headline: 'BEFORE / AFTER',
      subheadline: clipHeadline(title, 20),
      placement: 'center',
    }
  },
  reveal: (p) => {
    const title = naturalTitle(p.raw, 24)
    const vs = p.kind === 'vs' || /\bvs\.?\b|versus/i.test(p.raw)
    return {
      id: 'reveal',
      strategy: 'The Reveal',
      why: 'Teases a ranking or reveal that feels worth the click.',
      emotion: 'anticipation',
      visual: wowFrame(
        `${productVisualBlock(p)}, spotlight reveal moment`,
        'dark surrounding, one photograph',
        'left',
      ),
      headline: vs ? title : clipHeadline(title, 24),
      subheadline: vs ? 'WHO WINS?' : 'THE TRUTH',
      placement: 'left',
    }
  },
}

function factoryFor(kind: TopicKind, id: CreativeStrategyId): StrategyFactory {
  if (kind === 'music') {
    const music = musicFactories()[id]
    if (music) return music
  }
  return GENERAL_FACTORIES[id]
}

/** Pick three strategy families that fit the topic — never three grades of one image. */
export function pickStrategyIds(topic: string, rotate = 0): CreativeStrategyId[] {
  const parsed = parseTopic(topic)
  const t = parsed.raw.toLowerCase()
  const ranked: CreativeStrategyId[] = []

  if (parsed.kind === 'music') {
    ranked.push('emotion', 'curiosity', 'outcome', 'authority', 'reveal', 'transformation')
  } else if (isAutoProductTopic(t) || /\b(dealer|scam|booking|booked|refund)\b/.test(t)) {
    // Car / dealer stories → product packaging, not three face close-ups.
    ranked.push('warning', 'curiosity', 'outcome', 'contrarian', 'emotion')
  } else {
    if (/\b(mistake|mistakes|avoid|don't|dont|danger|risk|wrong|scam)\b/.test(t)) ranked.push('warning')
    if (parsed.kind === 'vs' || /\b(better|best|rank|top|review|test|tested)\b/.test(t)) {
      ranked.push('reveal', 'outcome')
    }
    if (/\b(secret|nobody|lied|truth|myth|myths)\b/.test(t)) ranked.push('contrarian', 'curiosity')
    if (parsed.kind === 'tutorial') ranked.push('authority', 'transformation')
    if (parsed.kind === 'story' || /\b(feel|reaction|shock)\b/.test(t)) ranked.push('emotion')
  }

  const fallback: CreativeStrategyId[] =
    parsed.kind === 'music'
      ? ['emotion', 'curiosity', 'outcome', 'authority', 'reveal', 'transformation']
      : isAutoProductTopic(t)
        ? ['warning', 'curiosity', 'outcome', 'contrarian', 'emotion', 'reveal', 'authority']
        : [
            'curiosity',
            'outcome',
            'contrarian',
            'warning',
            'emotion',
            'authority',
            'reveal',
            'transformation',
          ]

  const ordered = [...ranked, ...fallback]
  const unique: CreativeStrategyId[] = []
  for (const id of ordered) {
    if (!unique.includes(id)) unique.push(id)
  }
  const shift = ((rotate % unique.length) + unique.length) % unique.length
  const rotated = shift === 0 ? unique : [...unique.slice(shift), ...unique.slice(0, shift)]
  return rotated.slice(0, 3)
}

/** Build a creative brief from a natural-language video description. */
export function buildCreativeBrief(
  rawTopic: string,
  options: { rotate?: number } = {},
): CreativeBrief {
  const parsed = parseTopic(rawTopic)
  const ids = pickStrategyIds(parsed.raw, options.rotate ?? 0)
  const concepts = ids.map((id) => factoryFor(parsed.kind, id)(parsed))
  return {
    topic: parsed.raw,
    audience: guessAudience(parsed),
    promise: guessPromise(parsed),
    kind: parsed.kind,
    parsed,
    concepts,
  }
}

/** Image-model hint: strategy visual + topic, never the headline letters. */
export function visualHintForConcept(brief: CreativeBrief, concept: CreativeConcept) {
  const parsed = brief.parsed ?? parseTopic(brief.topic)
  const extras =
    parsed.kind === 'music'
      ? `Music video thumbnail for artist "${parsed.subject}" song "${parsed.detail || parsed.hookPhrase}".`
      : `Video topic: ${brief.topic}.`
  return `${concept.visual}. ${extras} No text, no letters, no watermarks on the image.`
}

export function fullHeadline(concept: CreativeConcept) {
  return [concept.headline, concept.subheadline].filter(Boolean).join(' ').trim()
}

/** Map parsed topic kind → product niche id when the maker should auto-pick. */
export function nicheIdForTopicKind(
  kind: TopicKind,
): 'music' | 'gaming' | 'finance' | 'tech' | 'education' | 'vlog' {
  if (kind === 'music') return 'music'
  if (kind === 'gaming') return 'gaming'
  if (kind === 'finance') return 'finance'
  if (kind === 'tech') return 'tech'
  if (kind === 'tutorial') return 'education'
  return 'vlog'
}
