import type { Niche } from './niches'
import type { Platform } from './platforms'

export type AiThumbOptions = {
  title: string
  niche: Niche
  platform: Platform
  /** Extra user hint, e.g. "woman with laptop, shocked expression" */
  hint?: string
}

/** YouTube-style prompt — faces + contrast for clickable thumbs (no API key). */
export function buildAiThumbnailPrompt(options: AiThumbOptions) {
  const title = options.title.trim() || 'YOUR TITLE HERE'
  const hint = options.hint?.trim()
  const face =
    hint ||
    'expressive creator face looking at camera, dramatic lighting, high contrast, sharp focus'
  const sizeHint =
    options.platform.orientation === 'vertical'
      ? 'vertical 9:16 mobile thumbnail'
      : options.platform.orientation === 'square'
        ? 'square social post thumbnail'
        : 'widescreen YouTube thumbnail 16:9'

  return [
    'Professional YouTube thumbnail photograph',
    sizeHint,
    face,
    `niche mood: ${options.niche.label}, ${options.niche.hint}`,
    `topic: ${title}`,
    'bold composition, left or right space for big title text',
    'cinematic color grade, saturated but natural skin, no watermarks, no logos, no readable text overlays',
  ].join(', ')
}

function pollinationsUrl(prompt: string, width: number, height: number, seed: number) {
  const encoded = encodeURIComponent(prompt.slice(0, 350))
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`
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
    throw new Error('AI service did not return an image. Try a shorter title or again later.')
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
