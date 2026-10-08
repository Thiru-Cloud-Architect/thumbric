export type FeatureItem = {
  id: string
  title: string
  description: string
  href: string
  available: boolean
  /** Short “where in the product” hint shown on the card. */
  where?: string
  cta?: string
  highlight?: boolean
}

/** Six balanced core tools — AI is called out separately above the grid. */
export const FEATURES: FeatureItem[] = [
  {
    id: 'platform-export',
    title: 'Platform-sized export',
    description: 'YouTube, Shorts, Instagram, LinkedIn, and Facebook — correct pixels in one tap.',
    href: '#editor',
    where: 'Editor · Media',
    cta: 'Open editor',
    available: true,
  },
  {
    id: 'live-preview',
    title: 'Live canvas preview',
    description: 'Title, photo, and stickers update instantly. Nothing uploads until you download.',
    href: '#editor',
    where: 'Editor · Preview',
    cta: 'Open canvas',
    available: true,
  },
  {
    id: 'thumb-score',
    title: 'Thumbnail Score',
    description: 'Upload a thumb. Get a 0–100 heuristic for attention, mobile readability, and text.',
    href: '/youtube-thumbnail-score',
    where: 'Free tools',
    cta: 'Score a thumbnail',
    available: true,
  },
  {
    id: 'drag-layout',
    title: 'Drag title & stickers',
    description: 'Move the headline and badges on the preview like a layout tool.',
    href: '#editor',
    where: 'Editor · canvas',
    cta: 'Open canvas',
    available: true,
  },
  {
    id: 'title-toolkit',
    title: 'Fonts, size & styles',
    description: '40+ display fonts, pixel title size, and outline / pop styles for mobile feeds.',
    href: '#editor-title',
    where: 'Editor · 2 Title',
    cta: 'Open Title',
    available: true,
  },
  {
    id: 'templates',
    title: 'Starter templates',
    description: 'YouTube, Shorts, LinkedIn, and minimal layouts without starting from zero.',
    href: '#editor-title',
    where: 'Editor · 2 Title',
    cta: 'Browse templates',
    available: true,
  },
]

/**
 * AI is the product story people look for — keep it out of the 6-card grid
 * and spell out what works today vs what is not funded yet.
 */
export const AI_FEATURE = {
  id: 'ai-scene',
  kicker: 'AI · free · in your browser',
  title: 'Describe the video. Get a cover. Add the title yourself.',
  description:
    'One box: a short description or a YouTube URL. Free AI builds a cover, then you place the title in the editor so the words stay yours.',
  nowLabel: 'Works now',
  nowItems: [
    'Describe a scene or paste a public YouTube link',
    'Review the cover, then open the editor with that image loaded',
    'If the free model is busy, a local studio still still appears',
  ],
  notYetLabel: 'Not yet',
  notYetItems: [
    'We read a YouTube title — we do not pull frames from the video',
    'Photoreal face-swap needs a paid model later',
  ],
  href: '/ai-thumbnail-maker',
  where: 'Tools · AI Thumbnail Maker',
  cta: 'Open AI Thumbnail Maker',
} as const
