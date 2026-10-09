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
])

function cleanTopic(raw: string) {
  return raw
    .replace(/^(cinematic\s+)?(still|shot|image|photo|photograph|thumbnail)\s+that\s+matches\s*:?\s*/i, '')
    .replace(/^(my\s+video\s+is\s+about\s+|this\s+video\s+is\s+about\s+|i\s+made\s+a\s+video\s+about\s+)/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function keywords(topic: string) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s$-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
    .slice(0, 8)
}

function titleCaseWords(words: string[], max = 4) {
  return words
    .slice(0, max)
    .map((w) => w.replace(/^\w/, (c) => c.toUpperCase()))
    .join(' ')
}

function guessAudience(topic: string, keys: string[]) {
  const t = topic.toLowerCase()
  if (/\b(beginner|first.?time|new to|starter)\b/.test(t)) return 'Beginners learning this for the first time'
  if (/\b(gamer|gaming|ranked|fps)\b/.test(t)) return 'Gamers who want better results'
  if (/\b(invest|money|finance|stock|crypto|house|mortgage)\b/.test(t)) return 'People making money decisions'
  if (/\b(cook|recipe|kitchen)\b/.test(t)) return 'Home cooks looking for a faster win'
  if (/\b(code|ai|developer|programming)\b/.test(t)) return 'Builders and tech-curious viewers'
  if (keys[0]) return `Viewers searching for ${keys.slice(0, 2).join(' / ')}`
  return 'Curious YouTube viewers'
}

function guessPromise(topic: string, keys: string[]) {
  const t = topic.toLowerCase()
  if (/\b(mistake|mistakes|avoid|don't|dont|wrong)\b/.test(t)) return 'Avoid costly mistakes'
  if (/\b(vs|versus|compared|better)\b/.test(t)) return 'See which option actually wins'
  if (/\b(secret|nobody|lied|truth)\b/.test(t)) return 'Hear what others skip'
  if (/\b(how to|guide|tutorial)\b/.test(t)) return 'Get a clear next step'
  if (keys.length) return `Get clarity on ${titleCaseWords(keys, 3)}`
  return 'Learn something that changes the click'
}

type StrategyFactory = (topic: string, keys: string[]) => CreativeConcept

const FACTORIES: Record<CreativeStrategyId, StrategyFactory> = {
  warning: (topic, keys) => {
    const subject = titleCaseWords(keys, 3) || 'THIS'
    return {
      id: 'warning',
      strategy: 'The Warning',
      why: 'Creates urgency — viewers pause before they make a mistake.',
      emotion: 'fear',
      visual: `dramatic warning scene about ${topic}, oversized hero subject, red urgency rim light, high contrast, empty third for title, single photograph`,
      headline: `DON'T ${subject.slice(0, 18).toUpperCase()}`.slice(0, 28),
      subheadline: 'YET',
      placement: 'left',
    }
  },
  curiosity: (topic, keys) => ({
    id: 'curiosity',
    strategy: 'The Curiosity Gap',
    why: 'Hints at a reveal without spoiling it — strong for browse sessions.',
    emotion: 'curiosity',
    visual: `mysterious cinematic still about ${topic}, subject half-lit, shallow depth of field, intrigue, empty third for title, one photo`,
    headline: keys[0] ? `WHAT ${keys[0].toUpperCase()} HIDES` : 'WHAT THEY HID',
    placement: 'left',
  }),
  outcome: (topic, keys) => ({
    id: 'outcome',
    strategy: 'The Outcome',
    why: 'Sells the result viewers want — clear promise on mobile.',
    emotion: 'desire',
    visual: `aspirational hero still of the successful outcome for ${topic}, bright premium light, clean background, space for bold type`,
    headline: keys.length >= 2 ? `${titleCaseWords(keys, 2).toUpperCase()} WIN` : 'REAL RESULTS',
    placement: 'right',
  }),
  contrarian: (topic, keys) => ({
    id: 'contrarian',
    strategy: 'The Contrarian',
    why: 'Challenges the default advice — spikes curiosity CTR.',
    emotion: 'surprise',
    visual: `unexpected twist visual for ${topic}, subject looking at camera in disbelief, cinematic grade, single frame`,
    headline: 'THEY LIED',
    subheadline: keys[0] ? `ABOUT ${keys[0].toUpperCase()}` : 'TO YOU',
    placement: 'center',
  }),
  emotion: (topic) => ({
    id: 'emotion',
    strategy: 'The Emotion',
    why: 'Face-forward reaction that reads as a tiny phone tile.',
    emotion: 'intensity',
    visual: `expressive human face reacting to ${topic}, close-up, catchlights, emotional intensity, soft bokeh, title space on the side`,
    headline: 'WAIT…',
    subheadline: 'WATCH THIS',
    placement: 'right',
  }),
  authority: (topic, keys) => ({
    id: 'authority',
    strategy: 'The Authority',
    why: 'Positions you as the guide who already figured it out.',
    emotion: 'confidence',
    visual: `confident creator or expert framing for ${topic}, clean studio light, premium still, calm negative space for type`,
    headline: keys[0] ? `${titleCaseWords(keys, 2).toUpperCase()} GUIDE` : 'THE REAL GUIDE',
    placement: 'left',
  }),
  transformation: (topic) => ({
    id: 'transformation',
    strategy: 'Before → After',
    why: 'Shows change — classic YouTube packaging for tutorials.',
    emotion: 'hope',
    visual: `single cinematic still suggesting transformation around ${topic}, brighter key light on the subject, hopeful grade — NOT a split collage`,
    headline: 'FROM ZERO',
    subheadline: 'TO THIS',
    placement: 'center',
  }),
  reveal: (topic, keys) => ({
    id: 'reveal',
    strategy: 'The Reveal',
    why: 'Teases a secret or ranking that feels worth the click.',
    emotion: 'anticipation',
    visual: `reveal moment still for ${topic}, spotlight on the key object or person, dark surrounding, one photograph`,
    headline: keys[0] ? `#1 ${keys[0].toUpperCase()}` : 'THE #1 PICK',
    placement: 'left',
  }),
}

/** Pick three strategy families that fit the topic — never three grades of one image. */
export function pickStrategyIds(topic: string, rotate = 0): CreativeStrategyId[] {
  const t = topic.toLowerCase()
  const ranked: CreativeStrategyId[] = []

  if (/\b(mistake|mistakes|avoid|don't|dont|danger|risk|wrong|scam)\b/.test(t)) ranked.push('warning')
  if (/\b(vs|versus|better|best|rank|top|review|test|tested)\b/.test(t)) ranked.push('reveal', 'outcome')
  if (/\b(secret|nobody|lied|truth|myth|myths)\b/.test(t)) ranked.push('contrarian', 'curiosity')
  if (/\b(how to|tutorial|guide|learn)\b/.test(t)) ranked.push('authority', 'transformation')
  if (/\b(feel|story|reaction|shock)\b/.test(t)) ranked.push('emotion')

  const fallback: CreativeStrategyId[] = [
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
  // §49 — “Generate 3 new directions” rotates the strategy set instead of rerunning the same three.
  const shift = ((rotate % unique.length) + unique.length) % unique.length
  const rotated = shift === 0 ? unique : [...unique.slice(shift), ...unique.slice(0, shift)]
  return rotated.slice(0, 3)
}

/** Build a creative brief from a natural-language video description. */
export function buildCreativeBrief(
  rawTopic: string,
  options: { rotate?: number } = {},
): CreativeBrief {
  const topic = cleanTopic(rawTopic) || 'my YouTube video'
  const keys = keywords(topic)
  const ids = pickStrategyIds(topic, options.rotate ?? 0)
  const concepts = ids.map((id) => FACTORIES[id](topic, keys))
  return {
    topic,
    audience: guessAudience(topic, keys),
    promise: guessPromise(topic, keys),
    concepts,
  }
}

/** Image-model hint: strategy visual + topic, never the headline letters. */
export function visualHintForConcept(brief: CreativeBrief, concept: CreativeConcept) {
  return `${concept.visual}. Topic context: ${brief.topic}. No text, no letters, no watermarks on the image.`
}

export function fullHeadline(concept: CreativeConcept) {
  return [concept.headline, concept.subheadline].filter(Boolean).join(' ').trim()
}
