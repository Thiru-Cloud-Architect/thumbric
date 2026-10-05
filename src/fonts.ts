export type FontId = 'bebas' | 'anton' | 'oswald' | 'dm'
export type FontSizeId = 'S' | 'M' | 'L' | 'XL'

export type FontOption = {
  id: FontId
  label: string
  hint: string
  css: string
  weight: number
}

export type FontSizeOption = {
  id: FontSizeId
  label: string
  scale: number
}

export const FONTS: FontOption[] = [
  {
    id: 'bebas',
    label: 'Big display',
    hint: 'Classic YouTube look',
    css: '"Bebas Neue", Impact, sans-serif',
    weight: 400,
  },
  {
    id: 'anton',
    label: 'Heavy',
    hint: 'Loud and thick',
    css: '"Anton", Impact, sans-serif',
    weight: 400,
  },
  {
    id: 'oswald',
    label: 'Condensed',
    hint: 'Tall and tight',
    css: '"Oswald", sans-serif',
    weight: 700,
  },
  {
    id: 'dm',
    label: 'Clean',
    hint: 'Readable sans',
    css: '"DM Sans", sans-serif',
    weight: 800,
  },
]

export const FONT_SIZES: FontSizeOption[] = [
  { id: 'S', label: 'S', scale: 0.78 },
  { id: 'M', label: 'M', scale: 1 },
  { id: 'L', label: 'L', scale: 1.18 },
  { id: 'XL', label: 'XL', scale: 1.35 },
]

export function getFont(id: FontId) {
  return FONTS.find((item) => item.id === id) ?? FONTS[0]
}

export function getFontSize(id: FontSizeId) {
  return FONT_SIZES.find((item) => item.id === id) ?? FONT_SIZES[1]
}
