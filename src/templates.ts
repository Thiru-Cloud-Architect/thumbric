import type { FontId } from './fonts'
import { DEFAULT_TITLE_FONT_SIZE } from './fonts'
import type { LayoutId } from './layout'
import type { NicheId } from './niches'
import type { TextStyleId } from './textStyle'
import type { PlatformId } from './platforms'
import type { StickerId } from './stickers'

export type TemplateId =
  | 'youtube-classic'
  | 'youtube-full'
  | 'shorts-bold'
  | 'minimal-clean'
  | 'linkedin-pro'
  | 'gaming-pop'

export type ThumbTemplate = {
  id: TemplateId
  label: string
  blurb: string
  platform: PlatformId
  layout: LayoutId
  fontId: FontId
  titleFontSizePx: number
  textStyleId: TextStyleId
  stickers: StickerId[]
  nicheId?: NicheId
  sampleTitle: string
  sampleTag: string
}

export const THUMB_TEMPLATES: ThumbTemplate[] = [
  {
    id: 'youtube-classic',
    label: 'YouTube split',
    blurb: 'Face left, title right',
    platform: 'youtube',
    layout: 'photo-left',
    fontId: 'bebas',
    titleFontSizePx: 110,
    textStyleId: 'classic',
    stickers: [],
    nicheId: 'tech',
    sampleTitle: 'I Tried This For 30 Days',
    sampleTag: 'NEW',
  },
  {
    id: 'youtube-full',
    label: 'Full-bleed CTR',
    blurb: 'Photo fills the frame',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'anton',
    titleFontSizePx: 118,
    textStyleId: 'thick',
    stickers: [],
    nicheId: 'vlog',
    sampleTitle: 'Do Not Watch This',
    sampleTag: 'WATCH',
  },
  {
    id: 'shorts-bold',
    label: 'Shorts / Reels',
    blurb: 'Tall cover, huge type',
    platform: 'shorts',
    layout: 'photo-top',
    fontId: 'anton',
    titleFontSizePx: 128,
    textStyleId: 'thick',
    stickers: [],
    nicheId: 'fitness',
    sampleTitle: '30 Second Glow Up',
    sampleTag: 'SHORTS',
  },
  {
    id: 'gaming-pop',
    label: 'Gaming pop',
    blurb: 'Yellow hook, neon mood',
    platform: 'youtube',
    layout: 'photo-right',
    fontId: 'bebas',
    titleFontSizePx: 116,
    textStyleId: 'yellow-pop',
    stickers: [],
    nicheId: 'gaming',
    sampleTitle: 'This Boss Is Broken',
    sampleTag: 'LIVE',
  },
  {
    id: 'minimal-clean',
    label: 'Clean text',
    blurb: 'Simple, lots of space',
    platform: 'youtube',
    layout: 'photo-right',
    fontId: 'dm-sans',
    titleFontSizePx: DEFAULT_TITLE_FONT_SIZE,
    textStyleId: 'minimal',
    stickers: [],
    nicheId: 'education',
    sampleTitle: 'The Simple Way To Start',
    sampleTag: 'GUIDE',
  },
  {
    id: 'linkedin-pro',
    label: 'LinkedIn / work',
    blurb: 'Pro, readable, calm',
    platform: 'linkedin',
    layout: 'photo-left',
    fontId: 'oswald',
    titleFontSizePx: 88,
    textStyleId: 'classic',
    stickers: [],
    nicheId: 'finance',
    sampleTitle: 'What Changed This Quarter',
    sampleTag: 'INSIGHT',
  },
]

export function getTemplate(id: TemplateId) {
  return THUMB_TEMPLATES.find((item) => item.id === id) ?? THUMB_TEMPLATES[0]
}
