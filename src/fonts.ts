import type { Platform } from './platforms'

export type FontCategory = 'display' | 'sans' | 'serif' | 'fun'

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
  | 'roboto'
  | 'inter'
  | 'open-sans'
  | 'nunito'
  | 'work-sans'
  | 'rubik'
  | 'dm-sans'
  | 'roboto-slab'
  | 'merriweather'
  | 'playfair'
  | 'bitter'
  | 'saira'
  | 'kanit'
  | 'exo2'
  | 'chakra-petch'
  | 'audiowide'
  | 'orbitron'
  | 'righteous'
  | 'alfa-slab'
  | 'concert-one'
  | 'passion-one'
  | 'lemonada'
  | 'permanent-marker'
  | 'pacifico'
  | 'caveat'
  | 'lobster'
  | 'satisfy'
  | 'press-start'
  | 'fredoka'

export type FontOption = {
  id: FontId
  label: string
  category: FontCategory
  css: string
  weight: number
}

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'display', label: 'Display — big YouTube titles' },
  { id: 'sans', label: 'Sans — clean & readable' },
  { id: 'serif', label: 'Serif — editorial' },
  { id: 'fun', label: 'Fun — casual & handwritten' },
]

export const TITLE_FONT_SIZE_MIN = 48
export const TITLE_FONT_SIZE_MAX = 200
export const DEFAULT_TITLE_FONT_SIZE = 96

export const FONTS: FontOption[] = [
  { id: 'bebas', label: 'Bebas Neue', category: 'display', css: '"Bebas Neue", Impact, sans-serif', weight: 400 },
  { id: 'anton', label: 'Anton', category: 'display', css: '"Anton", Impact, sans-serif', weight: 400 },
  { id: 'bangers', label: 'Bangers', category: 'display', css: '"Bangers", Impact, cursive', weight: 400 },
  { id: 'black-ops', label: 'Black Ops One', category: 'display', css: '"Black Ops One", sans-serif', weight: 400 },
  { id: 'archivo-black', label: 'Archivo Black', category: 'display', css: '"Archivo Black", sans-serif', weight: 400 },
  { id: 'bungee', label: 'Bungee', category: 'display', css: '"Bungee", cursive', weight: 400 },
  { id: 'russo-one', label: 'Russo One', category: 'display', css: '"Russo One", sans-serif', weight: 400 },
  { id: 'teko', label: 'Teko', category: 'display', css: '"Teko", sans-serif', weight: 700 },
  { id: 'oswald', label: 'Oswald', category: 'display', css: '"Oswald", sans-serif', weight: 700 },
  { id: 'saira', label: 'Saira Condensed', category: 'display', css: '"Saira Condensed", sans-serif', weight: 800 },
  { id: 'righteous', label: 'Righteous', category: 'display', css: '"Righteous", cursive', weight: 400 },
  { id: 'alfa-slab', label: 'Alfa Slab One', category: 'display', css: '"Alfa Slab One", serif', weight: 400 },
  { id: 'concert-one', label: 'Concert One', category: 'display', css: '"Concert One", cursive', weight: 400 },
  { id: 'passion-one', label: 'Passion One', category: 'display', css: '"Passion One", cursive', weight: 700 },
  { id: 'audiowide', label: 'Audiowide', category: 'display', css: '"Audiowide", sans-serif', weight: 400 },
  { id: 'orbitron', label: 'Orbitron', category: 'display', css: '"Orbitron", sans-serif', weight: 800 },
  { id: 'chakra-petch', label: 'Chakra Petch', category: 'display', css: '"Chakra Petch", sans-serif', weight: 700 },
  { id: 'press-start', label: 'Press Start 2P', category: 'display', css: '"Press Start 2P", monospace', weight: 400 },
  { id: 'montserrat', label: 'Montserrat', category: 'sans', css: '"Montserrat", sans-serif', weight: 800 },
  { id: 'poppins', label: 'Poppins', category: 'sans', css: '"Poppins", sans-serif', weight: 800 },
  { id: 'inter', label: 'Inter', category: 'sans', css: '"Inter", sans-serif', weight: 800 },
  { id: 'roboto', label: 'Roboto', category: 'sans', css: '"Roboto", sans-serif', weight: 900 },
  { id: 'open-sans', label: 'Open Sans', category: 'sans', css: '"Open Sans", sans-serif', weight: 800 },
  { id: 'nunito', label: 'Nunito', category: 'sans', css: '"Nunito", sans-serif', weight: 800 },
  { id: 'work-sans', label: 'Work Sans', category: 'sans', css: '"Work Sans", sans-serif', weight: 800 },
  { id: 'rubik', label: 'Rubik', category: 'sans', css: '"Rubik", sans-serif', weight: 800 },
  { id: 'kanit', label: 'Kanit', category: 'sans', css: '"Kanit", sans-serif', weight: 800 },
  { id: 'exo2', label: 'Exo 2', category: 'sans', css: '"Exo 2", sans-serif', weight: 800 },
  { id: 'dm-sans', label: 'DM Sans', category: 'sans', css: '"DM Sans", sans-serif', weight: 800 },
  { id: 'fredoka', label: 'Fredoka', category: 'sans', css: '"Fredoka", sans-serif', weight: 700 },
  { id: 'roboto-slab', label: 'Roboto Slab', category: 'serif', css: '"Roboto Slab", serif', weight: 800 },
  { id: 'merriweather', label: 'Merriweather', category: 'serif', css: '"Merriweather", serif', weight: 900 },
  { id: 'playfair', label: 'Playfair Display', category: 'serif', css: '"Playfair Display", serif', weight: 800 },
  { id: 'bitter', label: 'Bitter', category: 'serif', css: '"Bitter", serif', weight: 800 },
  { id: 'lemonada', label: 'Lemonada', category: 'fun', css: '"Lemonada", cursive', weight: 700 },
  { id: 'permanent-marker', label: 'Permanent Marker', category: 'fun', css: '"Permanent Marker", cursive', weight: 400 },
  { id: 'pacifico', label: 'Pacifico', category: 'fun', css: '"Pacifico", cursive', weight: 400 },
  { id: 'caveat', label: 'Caveat', category: 'fun', css: '"Caveat", cursive', weight: 700 },
  { id: 'lobster', label: 'Lobster', category: 'fun', css: '"Lobster", cursive', weight: 400 },
  { id: 'satisfy', label: 'Satisfy', category: 'fun', css: '"Satisfy", cursive', weight: 400 },
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
