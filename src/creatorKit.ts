import type { FontId } from './fonts'

export type CreatorKit = {
  primary: string
  secondary: string
  accent: string
  fontId: FontId
  logoDataUrl: string
  channelName: string
}

const STORAGE_KEY = 'thumbric-creator-kit-v1'

export const DEFAULT_CREATOR_KIT: CreatorKit = {
  primary: '#0A0E18',
  secondary: '#141C2E',
  accent: '#D6FF3C',
  fontId: 'bebas',
  logoDataUrl: '',
  channelName: 'Your channel',
}

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadCreatorKit(): CreatorKit {
  const raw = safeStorage()?.getItem(STORAGE_KEY)
  if (!raw) return { ...DEFAULT_CREATOR_KIT }
  try {
    const parsed = JSON.parse(raw) as Partial<CreatorKit>
    return { ...DEFAULT_CREATOR_KIT, ...parsed }
  } catch {
    return { ...DEFAULT_CREATOR_KIT }
  }
}

export function saveCreatorKit(kit: CreatorKit) {
  safeStorage()?.setItem(STORAGE_KEY, JSON.stringify(kit))
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
