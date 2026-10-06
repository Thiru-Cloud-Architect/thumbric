export type FeatureItem = {
  id: string
  title: string
  description: string
  href: string
  available: boolean
}

/** What Thumbric.ai actually does today — honest, user-facing. */
export const FEATURES: FeatureItem[] = [
  {
    id: 'platform-export',
    title: 'Platform-sized export',
    description: 'One tap for YouTube, Shorts, Instagram, LinkedIn, and Facebook dimensions.',
    href: '#editor',
    available: true,
  },
  {
    id: 'live-preview',
    title: 'Live canvas preview',
    description: 'See title, photo, and stickers update instantly — no server upload.',
    href: '#editor',
    available: true,
  },
  {
    id: 'quick-idea',
    title: 'Quick idea shuffle',
    description: 'Stuck? Random mood, layout, font, and title style in one tap (no stickers).',
    href: '#editor',
    available: true,
  },
  {
    id: 'drag-layout',
    title: 'Drag title & stickers',
    description: 'Move the headline and badges on the preview like a pro layout tool.',
    href: '#editor',
    available: true,
  },
  {
    id: 'title-toolkit',
    title: 'Fonts, size & title styles',
    description: '40+ display fonts, pixel title size, and outline / pop styles for mobile feeds.',
    href: '#editor',
    available: true,
  },
  {
    id: 'templates',
    title: 'Starter templates',
    description: 'YouTube, Shorts, LinkedIn, and minimal layouts without starting from zero.',
    href: '#editor',
    available: true,
  },
  {
    id: 'privacy',
    title: 'Photo stays on your device',
    description: 'Your image is processed in the browser until you choose to download.',
    href: '#faq',
    available: true,
  },
  {
    id: 'ai-url',
    title: 'AI thumbnail image',
    description: 'Generate a face/backdrop from your title & mood, then fine-tune on the live canvas.',
    href: '#editor',
    available: true,
  },
]
