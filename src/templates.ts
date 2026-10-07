import type { FontId } from './fonts'
import { DEFAULT_TITLE_FONT_SIZE } from './fonts'
import type { LayoutId } from './layout'
import type { NicheId } from './niches'
import type { TextStyleId } from './textStyle'
import type { PlatformId } from './platforms'
import type { StickerId } from './stickers'
import type { TitleAlign } from './titleKit'

export type TemplateId =
  | 'youtube-classic'
  | 'youtube-full'
  | 'yt-beast'
  | 'yt-reaction'
  | 'yt-cinematic'
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
  sampleLine2?: string
  titleAlign?: TitleAlign
}

export const THUMB_TEMPLATES: ThumbTemplate[] = [
  {
    id: 'yt-beast',
    label: 'Big yellow hook',
    blurb: 'Huge type, face zone, high contrast',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'bebas',
    titleFontSizePx: 138,
    textStyleId: 'yellow-pop',
    stickers: [],
    nicheId: 'vlog',
    sampleTitle: 'I SPENT $1',
    sampleLine2: 'AND THIS HAPPENED',
    sampleTag: '',
    titleAlign: 'left',
  },
  {
    id: 'yt-reaction',
    label: 'Face reaction',
    blurb: 'Close-up emotion, red punch title',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'anton',
    titleFontSizePx: 132,
    textStyleId: 'red-alert',
    stickers: [],
    nicheId: 'vlog',
    sampleTitle: 'WAIT WHAT',
    sampleLine2: 'THEY DID THIS',
    sampleTag: '',
    titleAlign: 'left',
  },
  {
    id: 'yt-cinematic',
    label: 'Cinematic lower-third',
    blurb: 'Full-bleed still, centered 2-line title',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'anton',
    titleFontSizePx: 118,
    textStyleId: 'thick',
    stickers: [],
    nicheId: 'travel',
    sampleTitle: 'THE LAST NIGHT',
    sampleLine2: 'IN THE CITY',
    sampleTag: '',
    titleAlign: 'center',
  },
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
    sampleTitle: 'I Tried This',
    sampleLine2: 'For 30 Days',
    sampleTag: 'NEW',
    titleAlign: 'left',
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
    sampleTitle: 'Do Not Watch',
    sampleLine2: 'This Tonight',
    sampleTag: 'WATCH',
    titleAlign: 'left',
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
    sampleTitle: '30 Second',
    sampleLine2: 'Glow Up',
    sampleTag: 'SHORTS',
    titleAlign: 'center',
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
    sampleTitle: 'This Boss',
    sampleLine2: 'Is Broken',
    sampleTag: 'LIVE',
    titleAlign: 'left',
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
    sampleTitle: 'The Simple Way',
    sampleLine2: 'To Start',
    sampleTag: 'GUIDE',
    titleAlign: 'left',
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
    sampleTitle: 'What Changed',
    sampleLine2: 'This Quarter',
    sampleTag: 'INSIGHT',
    titleAlign: 'left',
  },
]

export function getTemplate(id: TemplateId) {
  return THUMB_TEMPLATES.find((item) => item.id === id) ?? THUMB_TEMPLATES[0]
}
