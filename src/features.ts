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

/** What Thumbric.ai actually does today — honest, user-facing. */
export const FEATURES: FeatureItem[] = [
  {
    id: 'platform-export',
    title: 'Platform-sized export',
    description: 'YouTube, Shorts, Instagram, LinkedIn, and Facebook — correct pixels in one tap.',
    href: '#editor',
    where: 'Editor · Setup',
    cta: 'Open Setup',
    available: true,
  },
  {
    id: 'live-preview',
    title: 'Live canvas preview',
    description: 'Title, photo, and stickers update instantly. Nothing uploads until you download.',
    href: '#editor',
    where: 'Editor · Preview',
    cta: 'Open editor',
    available: true,
  },
  {
    id: 'quick-idea',
    title: 'Quick idea shuffle',
    description: 'Stuck? Random mood, layout, font, and title style in one tap.',
    href: '#editor',
    where: 'Editor · Setup',
    cta: 'Open Setup',
    available: true,
  },
  {
    id: 'drag-layout',
    title: 'Drag title & stickers',
    description: 'Move the headline and badges on the preview like a layout tool.',
    href: '#editor',
    where: 'Editor · canvas',
    cta: 'Open editor',
    available: true,
  },
  {
    id: 'title-toolkit',
    title: 'Fonts, size & styles',
    description: '40+ display fonts, pixel title size, and outline / pop styles for mobile feeds.',
    href: '#editor-title',
    where: 'Editor · 2 Title',
    cta: 'Open Title step',
    available: true,
  },
  {
    id: 'templates',
    title: 'Starter templates',
    description: 'YouTube, Shorts, LinkedIn, and minimal layouts without starting from zero.',
    href: '#editor-title',
    where: 'Editor · 2 Title',
    cta: 'Open Title step',
    available: true,
  },
]

/** Called out separately so AI is obvious — not buried in an 8-card grid. */
export const AI_FEATURE: FeatureItem = {
  id: 'ai-image',
  title: 'AI thumbnail image',
  description:
    'In the editor, open step 2 · Title. Under “Photo or AI face”, tap Generate AI image. Optional hint shapes the face/backdrop; then drag your title on the live canvas.',
  href: '#editor-ai',
  where: 'Editor · 2 Title · Photo or AI face',
  cta: 'Go to Generate AI image',
  available: true,
  highlight: true,
}
