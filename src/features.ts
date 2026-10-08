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
  kicker: 'AI · free · works in your browser',
  title: 'Describe the scene. AI draws the thumbnail backdrop.',
  description:
    'Write your YouTube title, then describe the visual scene. Free AI generates a full-bleed backdrop — you finish the title on the live canvas.',
  nowLabel: 'Works now',
  nowItems: [
    'Tap Try AI Thumbnail creator, then type a short scene (person, setting, mood)',
    'Generate 3 looks (Punch / Warm / Cinematic) — if free AI is busy, studio looks still fill',
    'Pick a favorite look, then style the title on the live canvas',
  ],
  notYetLabel: 'Not yet',
  notYetItems: [
    'No paste-a-YouTube-URL / full video analysis (that needs a paid model)',
    'AI draws a scene image — it does not watch your video file',
  ],
  href: '#editor-ai',
  where: 'Editor · AI Thumbnail creator',
  cta: 'Try AI Thumbnail creator',
} as const
