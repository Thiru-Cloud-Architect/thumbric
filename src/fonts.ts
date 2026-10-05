import type { Platform } from './platforms'

export type FontId =
  | 'bebas'
  | 'anton'
  | 'oswald'
  | 'bangers'
  | 'black-ops'
  | 'archivo-black'
  | 'teko'
  | 'russo-one'
  | 'bungee'
  | 'montserrat'
  | 'poppins'
  | 'roboto-slab'
  | 'merriweather'
  | 'playfair'
  | 'saira'
  | 'kanit'
  | 'exo2'
  | 'dm-sans'
  | 'permanent-marker'
  | 'pacifico'

export type FontOption = {
  id: FontId
  label: string
  css: string
  weight: number
}

export const TITLE_FONT_SIZE_MIN = 48
export const TITLE_FONT_SIZE_MAX = 200
export const DEFAULT_TITLE_FONT_SIZE = 96

export const FONTS: FontOption[] = [
  { id: 'bebas', label: 'Bebas Neue', css: '"Bebas Neue", Impact, sans-serif', weight: 400 },
  { id: 'anton', label: 'Anton', css: '"Anton", Impact, sans-serif', weight: 400 },
  { id: 'bangers', label: 'Bangers', css: '"Bangers", Impact, cursive', weight: 400 },
  { id: 'black-ops', label: 'Black Ops One', css: '"Black Ops One", Impact, sans-serif', weight: 400 },
  { id: 'archivo-black', label: 'Archivo Black', css: '"Archivo Black", sans-serif', weight: 400 },
  { id: 'bungee', label: 'Bungee', css: '"Bungee", cursive', weight: 400 },
  { id: 'russo-one', label: 'Russo One', css: '"Russo One", sans-serif', weight: 400 },
  { id: 'teko', label: 'Teko', css: '"Teko", sans-serif', weight: 700 },
  { id: 'oswald', label: 'Oswald', css: '"Oswald", sans-serif', weight: 700 },
  { id: 'saira', label: 'Saira Condensed', css: '"Saira Condensed", sans-serif', weight: 800 },
  { id: 'kanit', label: 'Kanit', css: '"Kanit", sans-serif', weight: 800 },
  { id: 'exo2', label: 'Exo 2', css: '"Exo 2", sans-serif', weight: 800 },
  { id: 'montserrat', label: 'Montserrat', css: '"Montserrat", sans-serif', weight: 800 },
  { id: 'poppins', label: 'Poppins', css: '"Poppins", sans-serif', weight: 800 },
  { id: 'dm-sans', label: 'DM Sans', css: '"DM Sans", sans-serif', weight: 800 },
  { id: 'roboto-slab', label: 'Roboto Slab', css: '"Roboto Slab", serif', weight: 800 },
  { id: 'merriweather', label: 'Merriweather', css: '"Merriweather", serif', weight: 900 },
  { id: 'playfair', label: 'Playfair Display', css: '"Playfair Display", serif', weight: 800 },
  { id: 'permanent-marker', label: 'Permanent Marker', css: '"Permanent Marker", cursive', weight: 400 },
  { id: 'pacifico', label: 'Pacifico', css: '"Pacifico", cursive', weight: 400 },
]

export function getFont(id: FontId) {
  return FONTS.find((item) => item.id === id) ?? FONTS[0]
}

export function clampTitleFontSize(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_TITLE_FONT_SIZE
  return Math.min(TITLE_FONT_SIZE_MAX, Math.max(TITLE_FONT_SIZE_MIN, Math.round(value)))
}

/** Title size in canvas pixels; `titleFontSizePx` is authored at 1280px-wide YouTube scale. */
export function scaledTitleFontSize(titleFontSizePx: number, platform: Platform) {
  return Math.round(clampTitleFontSize(titleFontSizePx) * (platform.width / 1280))
}
