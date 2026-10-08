import type { FontId } from './fonts'
import type { LayoutId, PhotoShapeId } from './layout'
import type { NicheId } from './niches'
import type { PlatformId } from './platforms'
import type { PlacedSticker } from './stickers'
import type { TextStyleId } from './textStyle'
import type { TitleAlign } from './titleKit'

export type AutosaveDraft = {
  version: 1
  updatedAt: number
  platformId: PlatformId
  nicheId: NicheId
  layout: LayoutId
  photoShape: PhotoShapeId
  accentOverride: string
  fontId: FontId
  textStyleId: TextStyleId
  titleFontSizePx: number
  textPos: { x: number; y: number }
  titleAlign: TitleAlign
  titleLine2: string
  titleFill: string
  titleOutlineWidth: number
  titleOutlineColor: string
  titleShadow: boolean
  title: string
  tag: string
  stickers: PlacedSticker[]
  aiHint: string
  textRotationDeg: number
  letterSpacing: number
  lineHeight: number
  titleOpacity: number
  photoDataUrl?: string
}

const KEY = 'thumbric-autosave-v1'

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadAutosave(): AutosaveDraft | null {
  const raw = safeStorage()?.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AutosaveDraft
    if (parsed?.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export function saveAutosave(draft: AutosaveDraft) {
  safeStorage()?.setItem(KEY, JSON.stringify({ ...draft, updatedAt: Date.now(), version: 1 as const }))
}

export function clearAutosave() {
  safeStorage()?.removeItem(KEY)
}

export function autosaveAgeLabel(updatedAt: number) {
  const mins = Math.round((Date.now() - updatedAt) / 60000)
  if (mins < 1) return 'Saved just now'
  if (mins === 1) return 'Saved 1 min ago'
  if (mins < 60) return `Saved ${mins} min ago`
  return `Saved ${Math.round(mins / 60)}h ago`
}
