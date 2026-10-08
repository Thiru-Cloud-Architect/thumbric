export type SiteRouteMeta = {
  path: string
  title: string
  description: string
  changefreq: 'weekly' | 'monthly'
  priority: string
}

export const SITE_ROUTES: SiteRouteMeta[] = [
  {
    path: '/',
    title: 'Thumbric — free YouTube & Shorts thumbnail maker',
    description:
      'Describe a scene, generate 3 YouTube thumbnail looks, then finish the title on a live canvas. Free in the browser.',
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/pricing',
    title: 'Thumbric pricing — Creator & Pro',
    description: 'Free watermarked previews. 7-day Creator trial, then Creator or Pro for clean YouTube thumbnail exports.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/career',
    title: 'Careers at Thumbric',
    description: 'Thumbric careers. No open roles right now — watch this page for engineering and creator-success jobs.',
    changefreq: 'monthly',
    priority: '0.3',
  },
  {
    path: '/tools',
    title: 'Free YouTube thumbnail tools — Thumbric',
    description:
      'Free YouTube thumbnail score, A/B tester, resizer, CTR calculator, and title analyzer. Register when you want to save a design.',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/youtube-thumbnail-score',
    title: 'YouTube Thumbnail Score — free analyzer | Thumbric',
    description:
      'Upload a thumbnail and get a Thumbric Score for attention, mobile readability, emotion, text, and focus. Heuristic, not CTR.',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/youtube-thumbnail-analyzer',
    title: 'YouTube Thumbnail Analyzer — free | Thumbric',
    description: 'Analyze an existing YouTube thumbnail in the browser. See weak spots, then generate 3 alternatives.',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/youtube-thumbnail-tester',
    title: 'YouTube Thumbnail Tester — A/B compare | Thumbric',
    description: 'Compare two thumbnails side by side with mobile-size previews and a heuristic pick. Not a CTR forecast.',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/youtube-thumbnail-resizer',
    title: 'YouTube Thumbnail Resizer — 1280×720 | Thumbric',
    description:
      'Resize thumbnails to YouTube, 50%/25% sizes, Shorts, square, or custom pixels with High, Balanced, or Light quality.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/youtube-ctr-calculator',
    title: 'YouTube CTR Calculator — free | Thumbric',
    description: 'Paste impressions and clicks to get CTR, with honest public-range bands — then improve the thumbnail.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/youtube-title-analyzer',
    title: 'YouTube Title Analyzer — free | Thumbric',
    description: 'Check title length, mobile truncation, numbers, and hook words before you upload.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/youtube-thumbnail-maker',
    title: 'YouTube Thumbnail Maker — free 1280×720 | Thumbric',
    description: 'Make a 1280×720 YouTube thumbnail in the browser. Describe a scene or upload a photo, then download PNG.',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/ai-thumbnail-maker',
    title: 'AI Thumbnail Maker — describe or paste a URL | Thumbric',
    description:
      'Describe your video or paste a YouTube URL. Free AI builds a click-optimized thumbnail — review, download HD, or finish in the editor.',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/gaming-thumbnail-maker',
    title: 'Gaming Thumbnail Maker — RGB & hype | Thumbric',
    description: 'Make gaming YouTube thumbnails with neon energy, big subjects, and a live title overlay.',
    changefreq: 'weekly',
    priority: '0.75',
  },
  {
    path: '/podcast-thumbnail-maker',
    title: 'Podcast Thumbnail Maker | Thumbric',
    description: 'Podcast and talk-show thumbnail layouts with strong faces, clean type, and 16:9 export.',
    changefreq: 'weekly',
    priority: '0.75',
  },
  {
    path: '/faceless-youtube-thumbnail-maker',
    title: 'Faceless YouTube Thumbnail Maker | Thumbric',
    description: 'Faceless-channel thumbnails: objects, scenes, and bold type without needing a face photo.',
    changefreq: 'weekly',
    priority: '0.75',
  },
  {
    path: '/shorts-thumbnail-maker',
    title: 'Shorts Thumbnail Maker — 9:16 | Thumbric',
    description: 'Make vertical Shorts and Reels covers (1080×1920) with the same AI scene + title canvas.',
    changefreq: 'weekly',
    priority: '0.75',
  },
  {
    path: '/learn',
    title: 'YouTube thumbnail lessons — Thumbric',
    description: 'Short lessons on mobile readability, how much text to use, and why faces win clicks.',
    changefreq: 'weekly',
    priority: '0.7',
  },
  {
    path: '/roast',
    title: 'Thumbnail Score result — Thumbric',
    description: 'Shared Thumbric Score. Heuristic thumbnail review — not a CTR prediction. Score your own next.',
    changefreq: 'weekly',
    priority: '0.4',
  },
  {
    path: '/legal',
    title: 'Privacy & terms — Thumbric',
    description: 'How Thumbric handles images, emails, and optional Worker sync. No sale of personal data.',
    changefreq: 'monthly',
    priority: '0.4',
  },
  {
    path: '/thumbnail-doctor',
    title: 'Thumbnail Doctor — score & improve | Thumbric',
    description: 'Diagnose a YouTube thumbnail, compare A/B, then improve with packaging strategies in the editor.',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/dashboard',
    title: 'Creator dashboard — Thumbric',
    description: 'Local product analytics: downloads, generations, and return visits on this device.',
    changefreq: 'weekly',
    priority: '0.5',
  },
  {
    path: '/account',
    title: 'Account — Thumbric',
    description: 'Device profile, plan status, referral link, and recent exports stored in this browser.',
    changefreq: 'weekly',
    priority: '0.5',
  },
  {
    path: '/feedback',
    title: 'Feedback — Thumbric',
    description: 'Bug reports and feature requests for the Thumbric editor and free tools.',
    changefreq: 'monthly',
    priority: '0.4',
  },
  {
    path: '/roadmap',
    title: 'Product roadmap — Thumbric',
    description: 'What shipped in Phase 1 vs paid AI, YouTube OAuth, and agency features.',
    changefreq: 'monthly',
    priority: '0.45',
  },
  {
    path: '/projects',
    title: 'Projects — Thumbric',
    description: 'Local thumbnail project history: open, duplicate, analyze, or delete exports from this browser.',
    changefreq: 'weekly',
    priority: '0.55',
  },
  {
    path: '/youtube-thumbnail-generator',
    title: 'YouTube Thumbnail Generator — free | Thumbric',
    description: 'Generate YouTube thumbnail concepts from a short idea, then finish titles on a live canvas.',
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    path: '/finance-thumbnail-maker',
    title: 'Finance Thumbnail Maker | Thumbric',
    description: 'Make finance and markets YouTube thumbnails with clear subjects and mobile-readable hooks.',
    changefreq: 'weekly',
    priority: '0.7',
  },
]

export function routeMeta(path: string) {
  const clean = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path
  return SITE_ROUTES.find((item) => item.path === clean) ?? SITE_ROUTES[0]!
}
