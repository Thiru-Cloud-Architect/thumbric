export type TitleAlign = 'left' | 'center' | 'right'

export type TitlePresetId = 'left' | 'center' | 'right'

export type TitlePreset = {
  id: TitlePresetId
  label: string
  blurb: string
  /** Normalized canvas position for the title block origin. */
  x: number
  y: number
  align: TitleAlign
}

/** YouTube-safe placements — avoid the bottom-right duration badge. */
export const TITLE_POSITION_PRESETS: TitlePreset[] = [
  {
    id: 'left',
    label: 'Left',
    blurb: 'Classic CTR, face on the right',
    x: 0.05,
    y: 0.54,
    align: 'left',
  },
  {
    id: 'center',
    label: 'Center',
    blurb: 'Lower-third poster title',
    x: 0.06,
    y: 0.58,
    align: 'center',
  },
  {
    id: 'right',
    label: 'Right',
    blurb: 'Face on the left, hook on the right',
    x: 0.42,
    y: 0.54,
    align: 'right',
  },
]

export function getTitlePreset(id: TitlePresetId | string | undefined) {
  return TITLE_POSITION_PRESETS.find((item) => item.id === id) ?? TITLE_POSITION_PRESETS[0]!
}

export const TITLE_FILL_PRESETS = [
  { id: 'white', label: 'White', value: '#FFFFFF' },
  { id: 'yellow', label: 'Yellow', value: '#FFE44D' },
  { id: 'red', label: 'Red', value: '#FF3B30' },
  { id: 'cyan', label: 'Cyan', value: '#7CFFF0' },
  { id: 'pink', label: 'Pink', value: '#FF7AB6' },
  { id: 'black', label: 'Black', value: '#111111' },
] as const

export const TITLE_OUTLINE_MIN = 0
export const TITLE_OUTLINE_MAX = 28
/** Sentinel: follow the selected title style chip. */
export const TITLE_OUTLINE_AUTO = -1

export function clampOutlineWidth(value: number) {
  if (!Number.isFinite(value)) return TITLE_OUTLINE_AUTO
  if (value < 0) return TITLE_OUTLINE_AUTO
  return Math.min(TITLE_OUTLINE_MAX, Math.max(TITLE_OUTLINE_MIN, Math.round(value)))
}

export function splitTitleLines(title: string, line2: string) {
  const authored = [title, line2].map((part) => part.replace(/\s+/g, ' ').trim()).filter(Boolean)
  if (authored.length >= 2) return authored.slice(0, 2)
  const fromBreaks = title
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  if (fromBreaks.length >= 2) return fromBreaks.slice(0, 2)
  return authored
}
