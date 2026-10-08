import type { AiStyleId } from './aiThumbnail'

export type AiHandoff = {
  hint?: string
  title?: string
  styleId?: AiStyleId
  photoDataUrl?: string
  source?: string
}

const KEY = 'thumbric-ai-handoff-v1'

export function saveAiHandoff(payload: AiHandoff) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function consumeAiHandoff(): AiHandoff | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    sessionStorage.removeItem(KEY)
    return JSON.parse(raw) as AiHandoff
  } catch {
    return null
  }
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(file)
  })
}

export function loadImageFromUrl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not open that image.'))
    image.src = src
  })
}
