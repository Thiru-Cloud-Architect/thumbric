import type { AiStyleId } from './aiThumbnail'

export type AiHandoffMode = 'ai' | 'improve' | 'classic'

export type AiHandoff = {
  hint?: string
  title?: string
  /** Second editable title line from creative brief. */
  titleLine2?: string
  /** Title placement preset id: left | center | right. */
  placement?: 'left' | 'center' | 'right'
  /** Strategy label for editor status (e.g. The Curiosity Gap). */
  strategy?: string
  styleId?: AiStyleId
  photoDataUrl?: string
  source?: string
  /** Which editor start mode to open after handoff. */
  mode?: AiHandoffMode
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

/** Convert a blob/object URL into a durable data URL for session handoff. */
export async function objectUrlToDataUrl(objectUrl: string) {
  const response = await fetch(objectUrl)
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not encode that image.'))
    reader.readAsDataURL(blob)
  })
}
