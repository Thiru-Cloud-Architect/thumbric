import type { Niche } from './niches'
import type { Platform } from './platforms'

export type AiThumbOptions = {
  title: string
  niche: Niche
  platform: Platform
  /** User scene description for the thumbnail backdrop (preferred). */
  hint?: string
}

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

/**
 * Build a free Pollinations prompt from the user's scene description.
 * Falls back to title + niche when the scene field is empty.
 * This is scene-image generation — not video analysis.
 */
export function buildAiThumbnailPrompt(options: AiThumbOptions) {
  const title = options.title.trim()
  const scene = sanitizeSceneText(options.hint ?? '')
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
  ].join(', ')

  const parts = [
    'Cinematic YouTube thumbnail photograph',
    aspectFraming(options.platform),
    `one coherent scene only: ${subject}`,
    `niche mood: ${options.niche.label} — ${options.niche.hint}`,
    titleClause,
    // CTR-style composition (leaders optimize for phone tile readability, not "pretty art").
    'single subject focus, subject on one third, clear negative space on the opposite side for a large title overlay',
    'high contrast, bold readable composition at phone-tile size (~320px wide), saturated cinematic color grade, sharp focus',
    'photoreal or stylized as the scene implies, expressive face or clear focal object preferred when the scene includes a person',
    `avoid: ${negative}`,
  ].filter(Boolean)

  return parts.join('. ')
}

function pollinationsUrl(prompt: string, width: number, height: number, seed: number) {
  // Keep prompt under URL limits but prefer enough room for negative cues.
  const encoded = encodeURIComponent(prompt.slice(0, 900))
  // Pin free Flux — Pollinations defaults have shifted (e.g. zimage); flux stays free/anonymous.
  // `nofeed=true` + random seed + timestamp reduce sticky cached junk regenerations.
  // Note: `nologo=true` may be ignored without a Pollinations account.
  const bust = Date.now().toString(36)
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true&enhance=true&nofeed=true&private=true&t=${bust}`
}

export async function generateAiThumbnailImage(
  options: AiThumbOptions,
  signal?: AbortSignal,
): Promise<{ image: HTMLImageElement; objectUrl: string; prompt: string }> {
  const prompt = buildAiThumbnailPrompt(options)
  const width = Math.min(1280, options.platform.width)
  const height = Math.round((width * options.platform.height) / options.platform.width)
  const seed = Math.floor(Math.random() * 1_000_000)
  const url = pollinationsUrl(prompt, width, height, seed)

  const response = await fetch(url, { signal, mode: 'cors' })
  if (!response.ok) {
    throw new Error(`AI image request failed (${response.status}). Try again in a moment.`)
  }
  const blob = await response.blob()
  if (!blob.type.startsWith('image/')) {
    throw new Error('AI service did not return an image. Try a shorter description or again later.')
  }
  const objectUrl = URL.createObjectURL(blob)
  const image = await loadImage(objectUrl, signal)
  return { image, objectUrl, prompt }
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
