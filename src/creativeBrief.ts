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
  'into',
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
])

function cleanTopic(raw: string) {
  return raw
    .replace(/^(cinematic\s+)?(still|shot|image|photo|photograph|thumbnail)\s+that\s+matches\s*:?\s*/i, '')
    .replace(/^(my\s+video\s+is\s+about\s+|this\s+video\s+is\s+about\s+|i\s+made\s+a\s+video\s+about\s+)/i, '')
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

function clipHeadline(value: string, max = 28) {
  const cleaned = value.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max).replace(/\s+\S*$/, '').trim() || cleaned.slice(0, max)
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
  if (/\b(invest|money|finance|stock|crypto|house|mortgage|loan)\b/.test(t)) return 'finance'
  if (/\b(iphone|android|ai|coding|developer|gadget|review|unbox)\b/.test(t)) return 'tech'
  if (/\b(how to|tutorial|guide|learn|course|tips)\b/.test(t)) return 'tutorial'
  if (/\b(story|storytime|relationship|couple|broke up|love story)\b/.test(t)) return 'story'
  return 'general'
}

/** Split "Artist - Song title" / "Artist: Song" patterns common on YouTube. */
function splitArtistTitle(topic: string): { subject: string; detail: string } | null {
  const match = topic.match(/^(.+?)\s*[-–—|:]\s+(.+)$/)
  if (!match) return null
  const subject = match[1]!.trim()
  const detail = match[2]!
    .trim()
    .replace(/\b(official\s+)?(video|audio|lyric\s+video|lyrics?|song|full\s+song|hd|4k)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (subject.length < 2 || detail.length < 2) return null
  return { subject, detail }
}

export function parseTopic(rawTopic: string): ParsedTopic {
  const raw = cleanTopic(rawTopic) || 'my YouTube video'
  const kind = detectKind(raw)
  const split = splitArtistTitle(raw)
  const keys = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s$-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .slice(0, 8)

  if (split) {
    const hookPhrase =
      kind === 'music'
        ? titleCasePhrase(split.detail, 4)
        : titleCasePhrase(split.detail || split.subject, 4)
    return {
      raw,
      kind,
      subject: titleCasePhrase(split.subject, 5),
      detail: titleCasePhrase(split.detail, 6),
      keys,
      hookPhrase: hookPhrase || titleCasePhrase(split.subject, 3),
    }
  }

  const hookPhrase = titleCasePhrase(keys.slice(0, 3).join(' '), 3) || 'This Video'
  return {
    raw,
    kind,
    subject: titleCasePhrase(keys.slice(0, 2).join(' '), 2) || hookPhrase,
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
      headline: clipHeadline((p.detail || p.hookPhrase).toUpperCase()),
      subheadline: p.subject ? clipHeadline(p.subject.toUpperCase(), 18) : 'FULL SONG',
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
      headline: clipHeadline(`NEW ${p.detail || p.hookPhrase}`.toUpperCase()),
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
      headline: clipHeadline((p.detail || p.hookPhrase).toUpperCase()),
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
      headline: clipHeadline(p.subject.toUpperCase(), 22),
      subheadline: clipHeadline((p.detail || 'OFFICIAL').toUpperCase(), 18),
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

const GENERAL_FACTORIES: Record<CreativeStrategyId, StrategyFactory> = {
  warning: (p) => ({
    id: 'warning',
    strategy: 'The Warning',
    why: 'Creates urgency — viewers pause before they make a mistake.',
    emotion: 'fear',
    visual: wowFrame(
      `dramatic warning scene about ${p.raw}, oversized hero subject with urgent expression`,
      'red-rim urgency light, high contrast',
      'left',
    ),
    headline: clipHeadline(`DON'T ${p.hookPhrase}`.toUpperCase()),
    subheadline: 'YET',
    placement: 'left',
  }),
  curiosity: (p) => {
    // Never "WHAT {firstToken} HIDES" — use a real hook phrase from the topic.
    const phrase = p.hookPhrase || p.subject
    return {
      id: 'curiosity',
      strategy: 'The Curiosity Gap',
      why: 'Hints at a reveal without spoiling it — strong for browse sessions.',
      emotion: 'curiosity',
      visual: wowFrame(
        `mysterious cinematic still about ${p.raw}, subject half-lit with intrigue`,
        'shallow depth of field, one clear hero',
        'left',
      ),
      headline: clipHeadline(`WHY ${phrase}`.toUpperCase()),
      subheadline: 'MATTERS',
      placement: 'left',
    }
  },
  outcome: (p) => ({
    id: 'outcome',
    strategy: 'The Outcome',
    why: 'Sells the result viewers want — clear promise on mobile.',
    emotion: 'desire',
    visual: wowFrame(
      `aspirational hero still of the successful outcome for ${p.raw}`,
      'bright premium light, clean background',
      'right',
    ),
    headline: clipHeadline(`${p.hookPhrase}`.toUpperCase()),
    subheadline: 'THAT WORKS',
    placement: 'right',
  }),
  contrarian: (p) => ({
    id: 'contrarian',
    strategy: 'The Contrarian',
    why: 'Challenges the default advice — spikes curiosity CTR.',
    emotion: 'surprise',
    visual: wowFrame(
      `unexpected twist visual for ${p.raw}, subject looking at camera in disbelief`,
      'cinematic grade, single frame',
      'center',
    ),
    headline: 'THEY LIED',
    subheadline: clipHeadline(`ABOUT ${p.hookPhrase}`.toUpperCase(), 22),
    placement: 'center',
  }),
  emotion: (p) => ({
    id: 'emotion',
    strategy: 'The Emotion',
    why: 'Face-forward reaction that reads as a tiny phone tile.',
    emotion: 'intensity',
    visual: wowFrame(
      `expressive human face reacting to ${p.raw}, close-up catchlights`,
      'emotional intensity, soft bokeh',
      'right',
    ),
    headline: 'WAIT…',
    subheadline: clipHeadline(p.hookPhrase.toUpperCase(), 18),
    placement: 'right',
  }),
  authority: (p) => ({
    id: 'authority',
    strategy: 'The Authority',
    why: 'Positions you as the guide who already figured it out.',
    emotion: 'trust',
    visual: wowFrame(
      `confident creator or expert framing for ${p.raw}, clean studio light`,
      'premium still, calm negative space for type',
      'left',
    ),
    headline: clipHeadline(`${p.hookPhrase}`.toUpperCase()),
    subheadline: 'GUIDE',
    placement: 'left',
  }),
  transformation: (p) => ({
    id: 'transformation',
    strategy: 'Before → After',
    why: 'Shows change — classic YouTube packaging for tutorials.',
    emotion: 'hope',
    visual: wowFrame(
      `single cinematic still suggesting transformation around ${p.raw}, brighter key light on the subject`,
      'hopeful grade — one frame only',
      'center',
    ),
    headline: 'FROM ZERO',
    subheadline: 'TO THIS',
    placement: 'center',
  }),
  reveal: (p) => ({
    id: 'reveal',
    strategy: 'The Reveal',
    why: 'Teases a secret or ranking that feels worth the click.',
    emotion: 'anticipation',
    visual: wowFrame(
      `reveal moment still for ${p.raw}, spotlight on the key object or person`,
      'dark surrounding, one photograph',
      'left',
    ),
    headline: clipHeadline(`#1 ${p.hookPhrase}`.toUpperCase()),
    placement: 'left',
  }),
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
