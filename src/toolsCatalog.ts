export type ToolNavItem = {
  id: string
  path: string
  label: string
  blurb: string
  nav: boolean
}

/** User-visible free tools — linked from the header menu and /tools hub. */
export const TOOL_NAV: ToolNavItem[] = [
  {
    id: 'score',
    path: '/youtube-thumbnail-score',
    label: 'Thumbnail Score',
    blurb: 'Upload a thumb. Get a 0–100 heuristic score.',
    nav: true,
  },
  {
    id: 'tester',
    path: '/youtube-thumbnail-tester',
    label: 'A/B Tester',
    blurb: 'Compare two thumbnails at phone size.',
    nav: true,
  },
  {
    id: 'resizer',
    path: '/youtube-thumbnail-resizer',
    label: 'Resizer',
    blurb: 'Crop to 1280×720, Shorts, or square.',
    nav: true,
  },
  {
    id: 'ctr',
    path: '/youtube-ctr-calculator',
    label: 'CTR Calculator',
    blurb: 'Impressions + clicks → CTR.',
    nav: true,
  },
  {
    id: 'title',
    path: '/youtube-title-analyzer',
    label: 'Title Analyzer',
    blurb: 'Length, mobile cutoff, hook words.',
    nav: true,
  },
  {
    id: 'ai',
    path: '/ai-thumbnail-maker',
    label: 'AI Thumbnail Maker',
    blurb: 'Describe a scene. Get 3 looks.',
    nav: true,
  },
  {
    id: 'doctor',
    path: '/thumbnail-doctor',
    label: 'Thumbnail Doctor',
    blurb: 'Score → compare → improve funnel.',
    nav: true,
  },
]

export const MAKER_NAV: ToolNavItem[] = [
  {
    id: 'yt',
    path: '/youtube-thumbnail-maker',
    label: 'YouTube maker',
    blurb: '1280×720 canvas + AI scene.',
    nav: false,
  },
  {
    id: 'gaming',
    path: '/gaming-thumbnail-maker',
    label: 'Gaming',
    blurb: 'RGB hype covers.',
    nav: false,
  },
  {
    id: 'podcast',
    path: '/podcast-thumbnail-maker',
    label: 'Podcast',
    blurb: 'Talk-show faces + type.',
    nav: false,
  },
  {
    id: 'faceless',
    path: '/faceless-youtube-thumbnail-maker',
    label: 'Faceless',
    blurb: 'Object/scene channels.',
    nav: false,
  },
  {
    id: 'shorts',
    path: '/shorts-thumbnail-maker',
    label: 'Shorts',
    blurb: 'Vertical 9:16 covers.',
    nav: false,
  },
]

export type MakerCopy = {
  path: string
  kicker: string
  h1: string
  h1Accent: string
  lede: string
  steps: { title: string; body: string }[]
  tips: string[]
  editorHash: string
  nicheHint: string
}

export const MAKER_PAGES: MakerCopy[] = [
  {
    path: '/youtube-thumbnail-maker',
    kicker: 'YouTube · 1280×720',
    h1: 'YouTube thumbnail maker',
    h1Accent: 'built for the click.',
    lede: 'Correct 16:9 pixels, a live title overlay, and 3 AI looks from a short scene description — no Canva resize dance.',
    steps: [
      { title: 'Describe or upload', body: 'Type the scene you want, or drop your own photo.' },
      { title: 'Pick a look', body: 'Generate 3 backdrops, then drag the title onto the live canvas.' },
      { title: 'Download PNG', body: 'Export 1280×720 ready for YouTube Studio.' },
    ],
    tips: [
      'Keep the subject large enough to read at phone-tile size.',
      'Leave a clean third of the frame for the title.',
      'Do not paint words into the AI image — add them in the editor so spelling stays yours.',
    ],
    editorHash: 'editor-ai',
    nicheHint: 'youtube',
  },
  {
    path: '/youtube-thumbnail-generator',
    kicker: 'Generator · free',
    h1: 'YouTube thumbnail generator',
    h1Accent: 'from idea to PNG.',
    lede: 'Generate packaging concepts from a short description, then finish titles on a live 1280×720 canvas. No video upload required.',
    steps: [
      { title: 'Describe the video', body: 'Topic, emotion, and who should be in frame.' },
      { title: 'Pick a concept', body: 'Three packaging angles — warning, curiosity, outcome, and more.' },
      { title: 'Export', body: 'Drag type, refine, download a YouTube-ready PNG.' },
    ],
    tips: [
      'A generator is only useful if text stays editable — ours never burns words into the pixels.',
      'Score an existing thumb first if you already publish weekly.',
    ],
    editorHash: 'editor-ai',
    nicheHint: 'youtube',
  },
  {
    path: '/finance-thumbnail-maker',
    kicker: 'Finance · markets',
    h1: 'Finance thumbnail maker',
    h1Accent: 'charts that still click.',
    lede: 'Market and money thumbnails: one clear subject, calm or alert color, and a short hook that reads on mobile.',
    steps: [
      { title: 'Pick Finance mood', body: 'Use the finance template or green-accent brand kit.' },
      { title: 'Keep one idea', body: 'Crash, tip, or explainer — not three charts at once.' },
      { title: 'Title does the stake', body: '3–5 words. Numbers help when they are huge.' },
    ],
    tips: [
      'Avoid fake “to the moon” clutter — clarity beats meme stickers for money topics.',
      'Run Thumbnail Doctor on last week’s upload before you redesign.',
    ],
    editorHash: 'editor',
    nicheHint: 'finance',
  },
  {
    path: '/ai-thumbnail-maker',
    kicker: 'AI · free scene stills',
    h1: 'AI thumbnail maker',
    h1Accent: 'describe the scene.',
    lede: 'You write who, where, and the mood. Thumbric fills 3 looks. You finish the title. It does not watch your video file.',
    steps: [
      { title: 'Write a scene', body: 'Example: “shocked creator, neon studio, laptop glow”.' },
      { title: 'Generate 3 looks', body: 'Free AI when it is available; cinematic studio stills if it is busy.' },
      { title: 'Style the hook', body: 'Two-line title, outline, drag placement — then download.' },
    ],
    tips: [
      'Photoreal faces at Canva quality need a paid fal key on the Worker. The free path is still a usable still + editor overlays.',
      'Ban collages in your scene text — say “one photo of …” not “grid of …”.' ,
    ],
    editorHash: 'editor-ai',
    nicheHint: 'ai',
  },
  {
    path: '/gaming-thumbnail-maker',
    kicker: 'Gaming · RGB hype',
    h1: 'Gaming thumbnail maker',
    h1Accent: 'neon, not clutter.',
    lede: 'Hype covers for Let’s Plays, ranked rants, and faceless shorts: one silhouette, one glow, one readable title.',
    steps: [
      { title: 'Set the energy', body: 'Try the Gaming hype scene preset in the AI editor.' },
      { title: 'Keep one subject', body: 'A character or controller — not a 2×2 collage of clips.' },
      { title: 'Yell with type', body: 'Thick outline, 3–5 words, high contrast on the empty third.' },
    ],
    tips: [
      'RGB glow is a seasoning, not the subject.',
      'Faces still win in gaming commentary — crop tighter than your capture card overlay.',
    ],
    editorHash: 'editor-ai',
    nicheHint: 'gaming',
  },
  {
    path: '/podcast-thumbnail-maker',
    kicker: 'Podcast · talk shows',
    h1: 'Podcast thumbnail maker',
    h1Accent: 'faces + a sentence.',
    lede: 'Episode art that reads as a conversation: guests large, title short, 16:9 for YouTube and 1:1 for feeds.',
    steps: [
      { title: 'Lead with a face', body: 'Upload a still or generate a portrait-style scene.' },
      { title: 'Name the episode', body: 'Put the hook in the title kit, not as burned-in AI letters.' },
      { title: 'Export the size you need', body: 'YouTube 16:9, or switch the platform chip to square.' },
    ],
    tips: [
      'Two people? Split the frame in the editor, do not ask the model for a collage.',
      'Waveform stickers are optional — the face is the click.',
    ],
    editorHash: 'editor',
    nicheHint: 'podcast',
  },
  {
    path: '/faceless-youtube-thumbnail-maker',
    kicker: 'Faceless channels',
    h1: 'Faceless thumbnail maker',
    h1Accent: 'objects that still click.',
    lede: 'No face on camera? Use a clear object, map, product, or cartoon scene — then a huge title.',
    steps: [
      { title: 'Pick a literal subject', body: '“Gold bar on black marble” beats “cinematic vibe”.' },
      { title: 'Generate 3 stills', body: 'Product-hero and cartoon chips exist for this exact job.' },
      { title: 'Title does the talking', body: 'Faceless thumbs live or die on 3 readable words.' },
    ],
    tips: [
      'Avoid stock-looking groups of people if your channel never shows a host.',
      'High contrast object + empty space is the whole game.',
    ],
    editorHash: 'editor-ai',
    nicheHint: 'faceless',
  },
  {
    path: '/shorts-thumbnail-maker',
    kicker: 'Shorts · 9:16',
    h1: 'Shorts thumbnail maker',
    h1Accent: 'vertical, still bold.',
    lede: 'Switch the platform chip to Shorts for 1080×1920. The same AI scene path works — keep the subject high in the frame.',
    steps: [
      { title: 'Choose Shorts size', body: 'Open the editor and tap Shorts / Reels before you generate.' },
      { title: 'Stack the subject', body: 'Faces and objects should sit in the upper two-thirds.' },
      { title: 'Fewer words', body: 'Vertical titles wrap fast. One line is usually enough.' },
    ],
    tips: [
      'YouTube may auto-pick a frame; a custom cover still helps in feeds that show it.',
      'Safe-zone: keep type away from the very bottom UI chrome.',
    ],
    editorHash: 'editor-ai',
    nicheHint: 'shorts',
  },
]
