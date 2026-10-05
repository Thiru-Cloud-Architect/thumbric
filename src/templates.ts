import type { FontId } from './fonts'
import { DEFAULT_TITLE_FONT_SIZE } from './fonts'
import type { LayoutId } from './layout'
import type { TextStyleId } from './textStyle'
import type { PlatformId } from './platforms'
import type { StickerId } from './stickers'

export type TemplateId =
  | 'youtube-classic'
  | 'shorts-bold'
  | 'minimal-clean'
  | 'linkedin-pro'

export type ThumbTemplate = {
  id: TemplateId
  label: string
  platform: PlatformId
  layout: LayoutId
  fontId: FontId
  titleFontSizePx: number
  textStyleId: TextStyleId
  stickers: StickerId[]
}

export const THUMB_TEMPLATES: ThumbTemplate[] = [
  {
    id: 'youtube-classic',
    label: 'Standard YouTube layout',
    platform: 'youtube',
    layout: 'photo-left',
    fontId: 'bebas',
    titleFontSizePx: 110,
    textStyleId: 'classic',
    stickers: ['new'],
  },
  {
    id: 'shorts-bold',
    label: 'Vertical Short / Reel',
    platform: 'shorts',
    layout: 'photo-top',
    fontId: 'anton',
    titleFontSizePx: 128,
    textStyleId: 'thick',
    stickers: ['fire', 'click'],
  },
  {
    id: 'minimal-clean',
    label: 'Simple text focus',
    platform: 'youtube',
    layout: 'photo-right',
    fontId: 'dm-sans',
    titleFontSizePx: DEFAULT_TITLE_FONT_SIZE,
    textStyleId: 'minimal',
    stickers: [],
  },
  {
    id: 'linkedin-pro',
    label: 'LinkedIn / work post',
    platform: 'linkedin',
    layout: 'photo-left',
    fontId: 'oswald',
    titleFontSizePx: 88,
    textStyleId: 'classic',
    stickers: ['tip'],
  },
]

export function getTemplate(id: TemplateId) {
  return THUMB_TEMPLATES.find((item) => item.id === id) ?? THUMB_TEMPLATES[0]
}
