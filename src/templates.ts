import type { FontId } from './fonts'
import { DEFAULT_TITLE_FONT_SIZE } from './fonts'
import type { LayoutId } from './layout'
import type { NicheId } from './niches'
import type { TextStyleId } from './textStyle'
import type { PlatformId } from './platforms'
import type { StickerId } from './stickers'
import type { TitleAlign } from './titleKit'

export type TemplateCategory =
  | 'all'
  | 'gaming'
  | 'finance'
  | 'education'
  | 'tech'
  | 'podcast'
  | 'vlog'
  | 'reaction'
  | 'commentary'

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
  | 'finance-chart'
  | 'edu-lesson'
  | 'podcast-guest'
  | 'tech-shipped'
  | 'commentary-hot'

export type ThumbTemplate = {
  id: TemplateId
  label: string
  blurb: string
  category: Exclude<TemplateCategory, 'all'>
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

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'tech', label: 'Tech' },
  { id: 'podcast', label: 'Podcast' },
  { id: 'vlog', label: 'Vlog' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'commentary', label: 'Commentary' },
]

export const THUMB_TEMPLATES: ThumbTemplate[] = [
  {
    id: 'yt-beast',
    label: 'Big yellow hook',
    blurb: 'Huge type, face zone, high contrast',
    category: 'vlog',
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
    category: 'reaction',
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
    category: 'commentary',
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
    category: 'tech',
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
    category: 'vlog',
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
    category: 'vlog',
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
    category: 'gaming',
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
    category: 'education',
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
    category: 'finance',
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
  {
    id: 'finance-chart',
    label: 'Finance breakdown',
    blurb: 'Calm panel, green accent hook',
    category: 'finance',
    platform: 'youtube',
    layout: 'photo-right',
    fontId: 'oswald',
    titleFontSizePx: 104,
    textStyleId: 'classic',
    stickers: ['rupee'],
    nicheId: 'finance',
    sampleTitle: 'STOCKS CRASHED',
    sampleLine2: 'WHAT NOW?',
    sampleTag: 'MARKET',
    titleAlign: 'left',
  },
  {
    id: 'edu-lesson',
    label: 'Lesson card',
    blurb: 'Education purple, readable type',
    category: 'education',
    platform: 'youtube',
    layout: 'photo-left',
    fontId: 'dm-sans',
    titleFontSizePx: 96,
    textStyleId: 'minimal',
    stickers: [],
    nicheId: 'education',
    sampleTitle: 'Learn This',
    sampleLine2: 'In 10 Minutes',
    sampleTag: 'CLASS',
    titleAlign: 'left',
  },
  {
    id: 'podcast-guest',
    label: 'Podcast guest',
    blurb: 'Talk-show split, warm panel',
    category: 'podcast',
    platform: 'youtube',
    layout: 'photo-left',
    fontId: 'anton',
    titleFontSizePx: 108,
    textStyleId: 'thick',
    stickers: ['live'],
    nicheId: 'music',
    sampleTitle: 'GUEST REVEALS',
    sampleLine2: 'THE TRUTH',
    sampleTag: 'EP 42',
    titleAlign: 'left',
  },
  {
    id: 'tech-shipped',
    label: 'Tech shipped',
    blurb: 'Grid backdrop, lime accent',
    category: 'tech',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'bebas',
    titleFontSizePx: 120,
    textStyleId: 'accent-fill',
    stickers: [],
    nicheId: 'tech',
    sampleTitle: 'SHIPPED',
    sampleLine2: 'FINALLY',
    sampleTag: 'AI',
    titleAlign: 'left',
  },
  {
    id: 'commentary-hot',
    label: 'Hot take',
    blurb: 'News stripe, alert title',
    category: 'commentary',
    platform: 'youtube',
    layout: 'photo-full',
    fontId: 'anton',
    titleFontSizePx: 126,
    textStyleId: 'red-alert',
    stickers: ['alert'],
    nicheId: 'news',
    sampleTitle: 'THEY LIED',
    sampleLine2: 'ABOUT THIS',
    sampleTag: '',
    titleAlign: 'center',
  },
]

export function templatesForCategory(category: TemplateCategory) {
  if (category === 'all') return THUMB_TEMPLATES
  return THUMB_TEMPLATES.filter((item) => item.category === category)
}

export function getTemplate(id: TemplateId) {
  return THUMB_TEMPLATES.find((item) => item.id === id) ?? THUMB_TEMPLATES[0]
}
