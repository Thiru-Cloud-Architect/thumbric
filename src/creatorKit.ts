import type { FontId } from './fonts'
import type { LayoutId } from './layout'

export type StylePreference = 'bold' | 'clean' | 'cinematic' | 'playful'

export type CreatorKit = {
  primary: string
  secondary: string
  accent: string
  fontId: FontId
  logoDataUrl: string
  channelName: string
  /** Up to 10 face / recurring asset data URLs */
  facePhotos: string[]
  preferredLayout: LayoutId
  stylePreference: StylePreference
  typicalExpression: string
}

const STORAGE_KEY = 'thumbric-creator-kit-v2'
const LEGACY_KEY = 'thumbric-creator-kit-v1'
const MAX_FACES = 10

export const DEFAULT_CREATOR_KIT: CreatorKit = {
  primary: '#0A0E18',
  secondary: '#141C2E',
  accent: '#D6FF3C',
  fontId: 'bebas',
  logoDataUrl: '',
  channelName: 'Your channel',
  facePhotos: [],
  preferredLayout: 'photo-left',
  stylePreference: 'bold',
  typicalExpression: 'surprised / high energy',
}

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadCreatorKit(): CreatorKit {
  const storage = safeStorage()
  const raw = storage?.getItem(STORAGE_KEY) || storage?.getItem(LEGACY_KEY)
  if (!raw) return { ...DEFAULT_CREATOR_KIT, facePhotos: [] }
  try {
    const parsed = JSON.parse(raw) as Partial<CreatorKit>
    return {
      ...DEFAULT_CREATOR_KIT,
      ...parsed,
      facePhotos: Array.isArray(parsed.facePhotos) ? parsed.facePhotos.slice(0, MAX_FACES) : [],
    }
  } catch {
    return { ...DEFAULT_CREATOR_KIT, facePhotos: [] }
  }
}

export function saveCreatorKit(kit: CreatorKit) {
  const storage = safeStorage()
  storage?.setItem(STORAGE_KEY, JSON.stringify(kit))
  storage?.removeItem(LEGACY_KEY)
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function addFacePhoto(kit: CreatorKit, dataUrl: string): CreatorKit {
  const faces = [...kit.facePhotos, dataUrl].slice(-MAX_FACES)
  return { ...kit, facePhotos: faces }
}

export function removeFacePhoto(kit: CreatorKit, index: number): CreatorKit {
  return { ...kit, facePhotos: kit.facePhotos.filter((_, i) => i !== index) }
}

export function styleHintFromKit(kit: CreatorKit) {
  const map: Record<StylePreference, string> = {
    bold: 'bold high-contrast YouTube packaging, oversized subject',
    clean: 'clean minimal thumbnail, lots of negative space, crisp type',
    cinematic: 'cinematic lower-third mood, dramatic light, film still energy',
    playful: 'playful colorful thumbnail, expressive face, energetic props',
  }
  const bits = [map[kit.stylePreference], `expression: ${kit.typicalExpression}`]
  if (kit.channelName && kit.channelName !== 'Your channel') bits.push(`channel vibe: ${kit.channelName}`)
  return bits.join(', ')
}
