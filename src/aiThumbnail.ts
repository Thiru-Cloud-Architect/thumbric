import type { Niche } from './niches'
import type { Platform } from './platforms'

/** Visual recipe chips — free Pollinations still, stronger CTR-style prompting. */
export type AiStyleId =
  | 'auto'
  | 'face-reaction'
  | 'kids-fun'
  | 'music-stage'
  | 'product-hero'
  | 'dark-moody'
  | 'cartoon'

export type AiStyle = {
  id: AiStyleId
  label: string
  /** Short chip subtitle so the look is obvious before generating. */
  blurb: string
  /** Extra prompt clauses for this look (atmosphere / grade — must not replace the scene subject). */
  boost: string
}

export const AI_STYLES: AiStyle[] = [
  {
    id: 'auto',
    label: 'Auto',
    blurb: 'Follow the scene',
    boost: 'match the scene description as closely as possible; lighting and color only',
  },
  {
    id: 'face-reaction',
    label: 'Face reaction',
    blurb: 'Human emotion close-up',
    boost:
      'close-up expressive human face looking at camera, strong emotion (shock, joy, or intensity), shallow depth of field, studio key light — ONLY when the scene asks for a person; never invent a human if the scene is animals/objects',
  },
  {
    id: 'kids-fun',
    label: 'Kids / fun',
    blurb: 'Animals & playful',
    boost:
      'bright colorful kids content energy, cute animals or playful characters, cheerful high-key lighting, family-friendly, cartoon-friendly photoreal mix — NOT a random adult stock family portrait unless the scene asks for people',
  },
  {
    id: 'music-stage',
    label: 'Music stage',
    blurb: 'Concert lights & glow',
    boost:
      'live music atmosphere only: warm stage spotlights, concert bokeh, haze, rim light on whatever subject the scene describes — do NOT replace animals/objects with a singer, idol, or face unless the scene explicitly asks for a person or performer',
  },
  {
    id: 'product-hero',
    label: 'Product hero',
    blurb: 'Clean object shot',
    boost:
      'clean product or object hero shot on simple dramatic background, soft studio lighting, lots of negative space for title',
  },
  {
    id: 'dark-moody',
    label: 'Dark moody',
    blurb: 'Cinematic shadows',
    boost:
      'dark cinematic thriller grade, rim light, high contrast, mysterious atmosphere, deep shadows applied to the described scene',
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    blurb: 'Illustrated look',
    boost:
      'stylized illustrated cartoon / 3D animated look, bold shapes, saturated colors, clear silhouette, YouTube kids-friendly illustration — not photoreal stock photo',
  },
]

export function getAiStyle(id: AiStyleId | string | undefined): AiStyle {
  return AI_STYLES.find((item) => item.id === id) ?? AI_STYLES[0]!
}

/** Lightweight scene cues used for style tips + prompt guards. */
export type SceneCues = {
  animals: boolean
  kids: boolean
  cartoon: boolean
  /** User explicitly asked for a person / face / singer / etc. */
  wantsHuman: boolean
  /** Animals/kids/cartoon without an explicit human ask. */
  nonHumanSubject: boolean
}

const ANIMAL_RE =
  /\b(animal|animals|puppy|puppies|dog|dogs|kitten|kittens|cat|cats|bunny|bunnies|rabbit|fox|bear|panda|lion|tiger|zoo|farm|woods?|forest|jungle|pet|pets|creature|creatures|bird|birds|duck|ducks|owl|squirrel|raccoon|wolf|deer|horse|pony|dinosaur|dino)\b/i
const KIDS_RE = /\b(kid|kids|child|children|toddler|baby|babies|nursery|preschool|family.?friendly|for kids)\b/i
const CARTOON_RE = /\b(cartoon|cartoony|animated|animation|anime.?style|illustrated|mascot|pixar.?like|3d.?render)\b/i
const HUMAN_RE =
  /\b(person|people|human|humans|man|woman|girl|boy|face|faces|singer|vocalist|artist|performer|idol|selfie|portrait|me |my face|creator|youtuber|vlogger|influencer|model)\b/i

export function analyzeScene(hint: string): SceneCues {
  const scene = sanitizeSceneText(hint)
  const animals = ANIMAL_RE.test(scene)
  const kids = KIDS_RE.test(scene)
  const cartoon = CARTOON_RE.test(scene)
  const wantsHuman = HUMAN_RE.test(scene)
  const nonHumanSubject = (animals || kids || cartoon) && !wantsHuman
  return { animals, kids, cartoon, wantsHuman, nonHumanSubject }
}

/**
 * Suggest Kids/fun or Cartoon when the scene text clearly points that way
 * and the current chip is a mismatch (e.g. Music stage + animals).
 */
export function suggestAiStyle(hint: string, currentId?: AiStyleId): AiStyleId | null {
  const cues = analyzeScene(hint)
  if (!cues.animals && !cues.kids && !cues.cartoon) return null

  const current = getAiStyle(currentId).id
  const goodFits: AiStyleId[] = ['kids-fun', 'cartoon', 'auto']
  if (goodFits.includes(current)) return null

  if (cues.cartoon && !cues.animals && !cues.kids) return 'cartoon'
  if (cues.animals || cues.kids) return cues.cartoon ? 'cartoon' : 'kids-fun'
  return 'cartoon'
}

export type AiThumbOptions = {
  title: string
  niche: Niche
  platform: Platform
  /** User scene description for the thumbnail backdrop (preferred). */
  hint?: string
  /** Optional style chip. */
  styleId?: AiStyleId
}

export type AiGeneratedImage = {
  image: HTMLImageElement
  objectUrl: string
  prompt: string
  seed: number
  styleId: AiStyleId
}

/** Soft ceiling so hung Pollinations requests still surface an error in the UI. */
export const AI_IMAGE_TIMEOUT_MS = 45_000

/** Pause between sequential free-tier variants (ms). */
export const AI_VARIANT_GAP_MS = 650

/** Strip junk punctuation that models treat as collage / split cues. */
export function sanitizeSceneText(raw: string) {
  return raw
    .replace(/[|/\\]+/g, ' ')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Short canvas title when the YouTube title field is empty.
 * Uses the scene text; never returns the old "YOUR TITLE HERE" placeholder.
 */
export function titleFromScene(hint: string, fallbackTitle = '') {
  const fromTitle = fallbackTitle.trim()
  if (fromTitle && fromTitle.toUpperCase() !== 'YOUR TITLE HERE') return fromTitle

  const scene = sanitizeSceneText(hint)
  if (!scene) return 'My Thumbnail'

  // Prefer the first clause; keep it short enough for a YouTube thumb.
  const clause = scene.split(/[,.–—:]/)[0]?.trim() || scene
  const words = clause.split(/\s+/).filter(Boolean).slice(0, 6)
  const short = words.join(' ')
  if (short.length <= 42) return short
  return `${short.slice(0, 39).trim()}…`
}

function aspectFraming(platform: Platform) {
  if (platform.orientation === 'vertical') {
    return 'vertical 9:16 mobile Shorts thumbnail, tall frame, single full-bleed scene'
  }
  if (platform.orientation === 'square') {
    return 'square 1:1 social thumbnail, single full-bleed scene'
  }
  return 'widescreen cinematic YouTube thumbnail still, exact 16:9 landscape, single full-bleed scene filling the entire frame'
}

function subjectGuard(cues: SceneCues) {
  if (!cues.nonHumanSubject) return ''
  return [
    'CRITICAL subject lock: depict ONLY the described non-human scene',
    'real or cartoon animals / playful creatures / woodland setting as written',
    'absolutely NO human face',
    'NO anime girl',
    'NO kemonomimi',
    'NO catgirl',
    'NO foxgirl',
    'NO person with animal ears',
    'NO furry humanoid',
    'NO anthro character',
    'NO singer portrait',
    'NO idol close-up',
    'NO stock model face layered onto animals',
  ].join(', ')
}

function styleBoostForScene(style: AiStyle, cues: SceneCues) {
  if (!cues.nonHumanSubject) return style.boost
  // Atmosphere recipes must never override animals into a face-reaction / singer shot.
  if (style.id === 'music-stage') {
    return 'warm concert stage lighting and bokeh on cute animals or the described woodland scene — animals remain the only subjects, no human performer'
  }
  if (style.id === 'face-reaction') {
    return 'expressive animal faces / reactions only (wide eyes, playful energy) — zero humans'
  }
  if (style.id === 'dark-moody') {
    return 'moody forest rim light and deep shadows on the animal scene — no human face'
  }
  return style.boost
}

/**
 * Build a free Pollinations prompt from the user's scene description.
 * Falls back to title + niche when the scene field is empty.
 * This is scene-image generation — not video analysis.
 */
export function buildAiThumbnailPrompt(options: AiThumbOptions) {
  const title = options.title.trim()
  const scene = sanitizeSceneText(options.hint ?? '')
  const style = getAiStyle(options.styleId)
  const cues = analyzeScene(scene)
  const subject =
    scene ||
    sanitizeSceneText(title) ||
    'expressive creator looking at camera, dramatic key light, shallow depth of field'

  const titleClause =
    title && title.toUpperCase() !== 'YOUR TITLE HERE'
      ? `video topic mood inspired by: ${title}`
      : ''

  const negative = [
    'no text',
    'no letters',
    'no typography',
    'no captions',
    'no subtitles',
    'no logos',
    'no watermarks',
    'no brand marks',
    'no UI chrome',
    'no collage',
    'no split screen',
    'no diptych',
    'no triptych',
    'no side by side panels',
    'no picture in picture',
    'no inset frames',
    'no borders',
    'no frames',
    'no montage grid',
    'no unrelated stock family portraits',
    'no watermark corner badges',
    ...(cues.nonHumanSubject
      ? [
          'no human',
          'no person',
          'no face close-up',
          'no anime girl',
          'no kemonomimi',
          'no furry humanoid',
          'no singer',
          'no idol',
        ]
      : []),
  ].join(', ')

  const medium =
    style.id === 'cartoon' || style.id === 'kids-fun' || cues.cartoon
      ? 'Bold YouTube thumbnail illustration / stylized still'
      : 'Cinematic YouTube thumbnail photograph'

  const focal =
    cues.nonHumanSubject
      ? 'clear animal or scene focal point with readable silhouette at phone-tile size — follow the scene literally'
      : 'expressive face or clear focal object when the scene includes a character — follow the scene literally'

  const parts = [
    medium,
    aspectFraming(options.platform),
    `one coherent scene only: ${subject}`,
    subjectGuard(cues),
    `style recipe (${style.label}): ${styleBoostForScene(style, cues)}`,
    `niche mood: ${options.niche.label} — ${options.niche.hint}`,
    titleClause,
    // CTR-style composition (leaders optimize for phone tile readability, not "pretty art").
    'single subject focus, subject on one third, clear negative space on the opposite side for a large title overlay',
    'high contrast, bold readable composition at phone-tile size (~320px wide), saturated cinematic color grade, sharp focus',
    focal,
    `avoid: ${negative}`,
  ].filter(Boolean)

  return parts.join('. ')
}

type PollinationsVariant = {
  label: string
  /** Query string after `?` (no leading ?). */
  query: string
}

/** Ordered retry set: quality first, then leaner / faster free endpoints. */
const POLLINATIONS_VARIANTS: PollinationsVariant[] = [
  {
    label: 'flux+enhance',
    query: 'model=flux&nologo=true&enhance=true&nofeed=true&private=true',
  },
  {
    label: 'flux',
    query: 'model=flux&nologo=true&nofeed=true&private=true',
  },
  {
    label: 'turbo',
    query: 'model=turbo&nologo=true&nofeed=true&private=true',
  },
]

/**
 * Build candidate Pollinations image URLs (primary + fallbacks).
 * Exported for unit tests.
 */
export function buildPollinationsCandidateUrls(
  prompt: string,
  width: number,
  height: number,
  seed: number,
  bust = Date.now().toString(36),
) {
  const encoded = encodeURIComponent(prompt.slice(0, 900))
  return POLLINATIONS_VARIANTS.map((variant) => ({
    label: variant.label,
    url: `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&${variant.query}&t=${bust}`,
  }))
}

export class AiHttpError extends Error {
  readonly status: number
  readonly retryable: boolean

  constructor(status: number, message: string, retryable = true) {
    super(message)
    this.name = 'AiHttpError'
    this.status = status
    this.retryable = retryable
  }
}

/** Friendlier copy for Pollinations / free-tier HTTP failures. */
export function friendlyAiHttpMessage(status: number) {
  if (status === 402) {
    return 'Free AI is rate-limited or needs payment right now (402). Wait a minute, then try again — we’ll fetch 1 look first so we don’t burn the free tier.'
  }
  if (status === 429) {
    return 'Free AI is busy (too many requests). Wait ~30–60s, then try again.'
  }
  if (status === 503 || status === 502) {
    return 'Free AI service is temporarily unavailable. Try again in a moment.'
  }
  if (status >= 500) {
    return `AI image service error (${status}). Try again shortly.`
  }
  return `AI image request failed (${status}). Try again in a moment.`
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

function isRateLimitedError(error: unknown) {
  return error instanceof AiHttpError && (error.status === 402 || error.status === 429)
}

function friendlyNetworkError(error: unknown): Error {
  if (isAbortError(error)) return error instanceof Error ? error : new DOMException('Aborted', 'AbortError')
  if (error instanceof AiHttpError) return error
  const message = error instanceof Error ? error.message : String(error)
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return new Error(
      'Could not reach the free AI image service (network/CORS/ad-block). Disable blockers for this site or try again.',
    )
  }
  return error instanceof Error ? error : new Error(message || 'AI scene generation failed.')
}

function mergeAbortSignals(userSignal: AbortSignal | undefined, timeoutMs: number) {
  const timeoutController = new AbortController()
  const timer = globalThis.setTimeout(() => {
    timeoutController.abort(new DOMException('AI scene timed out', 'TimeoutError'))
  }, timeoutMs)

  const signals = userSignal ? [userSignal, timeoutController.signal] : [timeoutController.signal]
  const anyFactory = (AbortSignal as typeof AbortSignal & { any?: (s: AbortSignal[]) => AbortSignal })
    .any
  const merged = typeof anyFactory === 'function' ? anyFactory(signals) : fallbackAnySignal(signals)

  return {
    signal: merged,
    timedOut: () => timeoutController.signal.aborted,
    dispose: () => globalThis.clearTimeout(timer),
  }
}

function fallbackAnySignal(signals: AbortSignal[]) {
  const controller = new AbortController()
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }
    signal.addEventListener(
      'abort',
      () => {
        controller.abort(signal.reason)
      },
      { once: true },
    )
  }
  return controller.signal
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = globalThis.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      globalThis.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function fetchImageBlob(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, mode: 'cors' })
  if (!response.ok) {
    throw new AiHttpError(response.status, friendlyAiHttpMessage(response.status), response.status !== 402)
  }
  const blob = await response.blob()
  if (!blob.type.startsWith('image/')) {
    throw new Error('AI service did not return an image. Try a shorter description or again later.')
  }
  return blob
}

export async function generateAiThumbnailImage(
  options: AiThumbOptions,
  signal?: AbortSignal,
  seedOverride?: number,
): Promise<AiGeneratedImage> {
  const styleId = getAiStyle(options.styleId).id
  const prompt = buildAiThumbnailPrompt({ ...options, styleId })
  const width = Math.min(1280, options.platform.width)
  const height = Math.round((width * options.platform.height) / options.platform.width)
  const seed = seedOverride ?? Math.floor(Math.random() * 1_000_000)
  const candidates = buildPollinationsCandidateUrls(prompt, width, height, seed)
  const gate = mergeAbortSignals(signal, AI_IMAGE_TIMEOUT_MS)

  let lastError: Error | null = null
  try {
    for (const candidate of candidates) {
      if (gate.signal.aborted) break
      try {
        const blob = await fetchImageBlob(candidate.url, gate.signal)
        const objectUrl = URL.createObjectURL(blob)
        const image = await loadImage(objectUrl, gate.signal)
        return { image, objectUrl, prompt, seed, styleId }
      } catch (error) {
        if (isAbortError(error) || (error instanceof DOMException && error.name === 'TimeoutError')) {
          throw error
        }
        // 402/429: do not fan out to other Pollinations models — same free tier.
        if (isRateLimitedError(error)) {
          throw error
        }
        lastError = friendlyNetworkError(error)
        // Try the next fallback host/variant.
      }
    }

    if (gate.timedOut()) {
      throw new Error(
        `AI scene timed out after ${Math.round(AI_IMAGE_TIMEOUT_MS / 1000)}s. Try a shorter scene, or tap Generate again.`,
      )
    }
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }
    throw lastError ?? new Error('AI scene generation failed. Try again in a moment.')
  } catch (error) {
    if (gate.timedOut() && (isAbortError(error) || (error instanceof DOMException && error.name === 'TimeoutError'))) {
      throw new Error(
        `AI scene timed out after ${Math.round(AI_IMAGE_TIMEOUT_MS / 1000)}s. Try a shorter scene, or tap Generate again.`,
      )
    }
    if (isAbortError(error) && signal?.aborted) {
      throw error
    }
    throw friendlyNetworkError(error)
  } finally {
    gate.dispose()
  }
}

export type AiVariantBatch = {
  results: AiGeneratedImage[]
  /** True when we stopped early because free tier returned 402/429. */
  rateLimited: boolean
  /** How many looks were requested vs returned. */
  requested: number
}

/**
 * Generate up to `count` different seeds so the user can pick the best backdrop.
 * Runs sequentially with a short gap; stops immediately on 402/429 so we don't spam
 * the free tier. Prefer `count=1` first, then call again for more options.
 */
export async function generateAiThumbnailVariants(
  options: AiThumbOptions,
  count = 3,
  signal?: AbortSignal,
  onProgress?: (done: number, total: number) => void,
): Promise<AiVariantBatch> {
  const total = Math.max(1, Math.min(4, count))
  const results: AiGeneratedImage[] = []
  const base = Math.floor(Math.random() * 1_000_000)
  let rateLimited = false

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break
    if (i > 0) {
      try {
        await sleep(AI_VARIANT_GAP_MS, signal)
      } catch (error) {
        if (isAbortError(error)) break
        throw error
      }
    }
    onProgress?.(i, total)
    try {
      const item = await generateAiThumbnailImage(options, signal, base + i * 9973)
      results.push(item)
      onProgress?.(i + 1, total)
    } catch (error) {
      if (isAbortError(error) || (error instanceof DOMException && error.name === 'TimeoutError')) {
        if (results.length > 0 && !(signal?.aborted)) {
          break
        }
        throw error
      }
      if (isRateLimitedError(error)) {
        rateLimited = true
        // Do not burn more sequential calls after 402/429.
        if (results.length === 0) throw friendlyNetworkError(error)
        break
      }
      // Soft-fail one seed; continue so the picker still gets something.
      if (i === total - 1 && results.length === 0) {
        throw friendlyNetworkError(error)
      }
    }
  }

  if (results.length === 0) {
    throw new Error('AI scene generation failed. Try again in a moment.')
  }
  return { results, rateLimited, requested: total }
}

function loadImage(src: string, signal?: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    const onAbort = () => {
      image.src = ''
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    image.onload = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve(image)
    }
    image.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      reject(new Error('Could not decode the AI image.'))
    }
    image.src = src
  })
}
