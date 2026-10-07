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
  /\b(animal|animals|puppy|puppies|dog|dogs|kitten|kittens|cat|cats|bunny|bunnies|rabbit|fox|bear|panda|lion|tiger|zoo|farm|woods?|forest|jungle|pet|pets|creature|creatures|bird|birds|duck|ducks|owl|squirrel|raccoon|wolf|deer|horse|pony|dinosaur|dino|elephant|monkey|penguin|frog|pig|cow|chick|chicken|koala|otter)\b/i
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
  /**
   * 0–2 look index. Each look uses a different composition (left / right / center)
   * so three seeds are not the same crop with a different noise seed.
   */
  variantIndex?: number
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

/** Pause before look 2 on a fresh batch (ms). Short gaps 402 the free tier. */
export const AI_VARIANT_GAP_MS = 7_000

/** Extra wait added before each later look (look 3 = gap + step). */
export const AI_VARIANT_GAP_STEP_MS = 4_000

/** Short lead-in when retrying remaining looks after a cooldown. */
export const AI_RETRY_LEAD_MS = 1_800

/** How many looks we try to fill in the picker. Sequential, not parallel. */
export const AI_LOOK_TARGET = 3

/** Pollinations URL prompt slice — keep subject at the front so this never chops the scene. */
export const AI_PROMPT_MAX_CHARS = 880

/** Seconds to wait after a 402 before retrying remaining looks. */
export const AI_RATE_LIMIT_COOLDOWN_SEC = 45

/** Milliseconds to wait before requesting this 0-based look index. */
export function waitMsBeforeLook(
  lookIndex: number,
  options: { firstOfRetryBatch?: boolean } = {},
) {
  if (lookIndex <= 0) return 0
  if (options.firstOfRetryBatch) return AI_RETRY_LEAD_MS
  return AI_VARIANT_GAP_MS + (lookIndex - 1) * AI_VARIANT_GAP_STEP_MS
}

/** One-tap scene starters so the AI path is not a blank box. */
export const AI_SCENE_PRESETS = [
  {
    id: 'kids-animals',
    label: 'Kids animals',
    hint: 'cute cartoon animals playing in a sunny jungle, big expressive eyes, bright colors',
    styleId: 'cartoon' as AiStyleId,
  },
  {
    id: 'face-shock',
    label: 'Face reaction',
    hint: 'close-up shocked creator looking at camera, neon studio lights, high emotion',
    styleId: 'face-reaction' as AiStyleId,
  },
  {
    id: 'product',
    label: 'Product glow',
    hint: 'premium gadget floating over dark marble, dramatic rim light, luxury still life',
    styleId: 'product-hero' as AiStyleId,
  },
  {
    id: 'gaming',
    label: 'Gaming hype',
    hint: 'intense gamer silhouette in RGB neon room, controller in hand, cinematic fog',
    styleId: 'dark-moody' as AiStyleId,
  },
  {
    id: 'stage',
    label: 'Music stage',
    hint: 'singer on concert stage, warm spotlights, crowd bokeh, dramatic haze',
    styleId: 'music-stage' as AiStyleId,
  },
] as const

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
    return 'vertical 9:16 Shorts thumbnail, tall full-bleed scene'
  }
  if (platform.orientation === 'square') {
    return 'square 1:1 social thumbnail, full-bleed scene'
  }
  return 'widescreen cinematic YouTube thumbnail still, exact 16:9 landscape, single full-bleed scene'
}

function compositionForVariant(index: number) {
  const variants = [
    'hero subject on the LEFT third, large empty negative space on the RIGHT for a title overlay',
    'hero subject on the RIGHT third, large empty negative space on the LEFT for a title overlay',
    'tight centered hero close-up, keep the LOWER third simpler for a title overlay',
  ]
  return variants[((index % variants.length) + variants.length) % variants.length]!
}

function subjectGuard(cues: SceneCues) {
  if (!cues.nonHumanSubject) return ''
  return 'CRITICAL subject lock: ONLY the described animals or creatures, no human face, no anime girl, no kemonomimi, no catgirl, no furry humanoid, no singer, no idol, no stock model'
}

function styleBoostForScene(style: AiStyle, cues: SceneCues) {
  if (!cues.nonHumanSubject) return style.boost
  if (style.id === 'music-stage') {
    return 'warm concert stage lighting and bokeh on the animal scene — animals remain the only subjects, no human performer'
  }
  if (style.id === 'face-reaction') {
    return 'expressive animal faces and reactions only, wide eyes, playful energy, zero humans'
  }
  if (style.id === 'dark-moody') {
    return 'moody forest rim light and deep shadows on the animal scene, no human face'
  }
  return style.boost
}

/** Join prompt parts, never chopping the scene subject if we hit the URL cap. */
export function clampAiPrompt(parts: string[], maxChars = AI_PROMPT_MAX_CHARS) {
  const cleaned = parts.map((part) => part.trim()).filter(Boolean)
  const joined = cleaned.join('. ')
  if (joined.length <= maxChars) return joined
  const head = cleaned.slice(0, 3).join('. ')
  const rest = cleaned.slice(3).join('. ')
  const budget = maxChars - head.length - 2
  if (budget < 24) return head.slice(0, maxChars)
  return `${head}. ${rest.slice(0, budget)}`
}

/**
 * Build a free Pollinations prompt from the user's scene description.
 * Falls back to title + niche when the scene field is empty.
 * This is scene-image generation — not video analysis.
 * Keep it short: Flux follows the first clauses; a 2k-char essay gets sliced.
 */
export function buildAiThumbnailPrompt(options: AiThumbOptions) {
  const title = options.title.trim()
  const scene = sanitizeSceneText(options.hint ?? '')
  const style = getAiStyle(options.styleId)
  const cues = analyzeScene(scene)
  const variantIndex = options.variantIndex ?? 0
  const subject =
    scene ||
    sanitizeSceneText(title) ||
    'expressive creator looking at camera, dramatic key light, shallow depth of field'

  const titleClause =
    title && title.toUpperCase() !== 'YOUR TITLE HERE'
      ? `video topic mood: ${title}`
      : ''

  const negative = cues.nonHumanSubject
    ? 'no text, no letters, no logos, no watermarks, no collage, no split screen, no frames, no human, no person, no anime girl, no kemonomimi, no singer, no idol'
    : 'no text, no letters, no logos, no watermarks, no collage, no split screen, no diptych, no frames, no UI chrome'

  const medium =
    style.id === 'cartoon' || style.id === 'kids-fun' || cues.cartoon
      ? 'Bold YouTube thumbnail illustration, stylized still'
      : 'Cinematic YouTube thumbnail photograph'

  const focal = cues.nonHumanSubject
    ? 'clear animal silhouette, readable at phone-tile size, follow the scene literally'
    : 'one clear focal subject, readable at phone-tile size, follow the scene literally'

  return clampAiPrompt([
    medium,
    aspectFraming(options.platform),
    `one coherent scene only: ${subject}`,
    subjectGuard(cues),
    `composition: ${compositionForVariant(variantIndex)}`,
    `style (${style.label}): ${styleBoostForScene(style, cues)}`,
    `niche mood: ${options.niche.label} — ${options.niche.hint}`,
    titleClause,
    'high contrast, saturated cinematic color, sharp focus, ~320px phone-tile readability',
    focal,
    `avoid: ${negative}`,
  ])
}

type PollinationsVariant = {
  label: string
  /** Query string after `?` (no leading ?). */
  query: string
}

/**
 * Ordered retry set. Flux without enhance first — enhance is slower and 402s more
 * on the free tier. Turbo is the fast fallback. Enhance is last-ditch quality.
 */
const POLLINATIONS_VARIANTS: PollinationsVariant[] = [
  {
    label: 'flux',
    query: 'model=flux&nologo=true&nofeed=true&private=true',
  },
  {
    label: 'turbo',
    query: 'model=turbo&nologo=true&nofeed=true&private=true',
  },
  {
    label: 'flux+enhance',
    query: 'model=flux&nologo=true&enhance=true&nofeed=true&private=true',
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
  const encoded = encodeURIComponent(prompt.slice(0, AI_PROMPT_MAX_CHARS))
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

/** Friendlier copy for free-tier HTTP failures — no provider codes in the UI. */
export function friendlyAiHttpMessage(status: number) {
  if (status === 402 || status === 429) {
    return 'Free AI is busy — try again in a minute.'
  }
  if (status === 503 || status === 502) {
    return 'Free AI is taking a break. Try again in a moment.'
  }
  if (status >= 500) {
    return 'Free AI had a hiccup. Try again shortly.'
  }
  return 'Could not create that look. Try again in a moment.'
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function isAiRateLimitedError(error: unknown) {
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
        if (isAiRateLimitedError(error)) {
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
  /** How many looks this call tried to create. */
  requested: number
  /** Absolute 0-based index of the first look in this batch. */
  startIndex: number
}

export type GenerateAiVariantsHooks = {
  count?: number
  signal?: AbortSignal
  /** Continue compositions from this look index (1 when retrying looks 2–3). */
  startIndex?: number
  onProgress?: (done: number, total: number) => void
  onItem?: (item: AiGeneratedImage, index: number) => void
  onWait?: (lookIndex: number, waitMs: number) => void
}

/**
 * Generate up to `count` different looks so the user can pick the best backdrop.
 * Sequential with a long gap; each look uses a different composition (left/right/center).
 * Stops immediately on 402/429 so we don't spam the free tier.
 * `onItem` fires as soon as a look lands so the canvas is not empty until all 3 finish.
 */
export async function generateAiThumbnailVariants(
  options: AiThumbOptions,
  {
    count = AI_LOOK_TARGET,
    signal,
    startIndex = 0,
    onProgress,
    onItem,
    onWait,
  }: GenerateAiVariantsHooks = {},
): Promise<AiVariantBatch> {
  const total = Math.max(1, Math.min(AI_LOOK_TARGET - startIndex, count))
  const results: AiGeneratedImage[] = []
  const base = Math.floor(Math.random() * 1_000_000)
  let rateLimited = false

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break
    const lookIndex = startIndex + i
    const waitMs = waitMsBeforeLook(lookIndex, {
      firstOfRetryBatch: i === 0 && startIndex > 0,
    })
    if (waitMs > 0) {
      onWait?.(lookIndex, waitMs)
      try {
        await sleep(waitMs, signal)
      } catch (error) {
        if (isAbortError(error)) break
        throw error
      }
    }
    onProgress?.(i, total)
    try {
      const item = await generateAiThumbnailImage(
        { ...options, variantIndex: lookIndex },
        signal,
        base + lookIndex * 9973,
      )
      results.push(item)
      onItem?.(item, results.length - 1)
      onProgress?.(i + 1, total)
    } catch (error) {
      if (isAbortError(error) || (error instanceof DOMException && error.name === 'TimeoutError')) {
        if (results.length > 0 && !signal?.aborted) {
          break
        }
        throw error
      }
      if (isAiRateLimitedError(error)) {
        rateLimited = true
        if (results.length === 0) throw friendlyNetworkError(error)
        break
      }
      if (i === total - 1 && results.length === 0) {
        throw friendlyNetworkError(error)
      }
    }
  }

  if (results.length === 0) {
    throw new Error('Could not create those looks. Try again in a moment.')
  }
  return { results, rateLimited, requested: total, startIndex }
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
