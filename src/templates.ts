import type { FontId, FontSizeId } from './fonts'
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
  hint: string
  platform: PlatformId
  layout: LayoutId
  fontId: FontId
  fontSizeId: FontSizeId
  textStyleId: TextStyleId
  stickers: StickerId[]
}

export const THUMB_TEMPLATES: ThumbTemplate[] = [
  {
    id: 'youtube-classic',
    label: 'YouTube classic',
    hint: 'Photo left, big title',
    platform: 'youtube',
    layout: 'photo-left',
    fontId: 'bebas',
    fontSizeId: 'L',
    textStyleId: 'classic',
    stickers: ['new'],
  },
  {
    id: 'shorts-bold',
    label: 'Shorts punch',
    hint: 'Vertical, heavy font',
    platform: 'shorts',
    layout: 'photo-top',
    fontId: 'anton',
    fontSizeId: 'XL',
    textStyleId: 'thick',
    stickers: ['fire', 'click'],
  },
  {
    id: 'minimal-clean',
    label: 'Minimal text',
    hint: 'Less stroke, smaller tag',
    platform: 'youtube',
    layout: 'photo-right',
    fontId: 'dm',
    fontSizeId: 'M',
    textStyleId: 'minimal',
    stickers: [],
  },
  {
    id: 'linkedin-pro',
    label: 'LinkedIn pro',
    hint: 'Condensed, calm look',
    platform: 'linkedin',
    layout: 'photo-left',
    fontId: 'oswald',
    fontSizeId: 'M',
    textStyleId: 'classic',
    stickers: ['tip'],
  },
]

export function getTemplate(id: TemplateId) {
  return THUMB_TEMPLATES.find((item) => item.id === id) ?? THUMB_TEMPLATES[0]
}
