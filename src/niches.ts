export type NicheId =
  | 'tech'
  | 'finance'
  | 'education'
  | 'gaming'
  | 'cooking'
  | 'vlog'
  | 'fitness'
  | 'beauty'
  | 'music'
  | 'comedy'
  | 'news'
  | 'travel'
  | 'sports'
  | 'autos'
  | 'business'
  | 'parenting'
  | 'motivation'
  | 'diy'

export type ShapeId =
  | 'bars'
  | 'coins'
  | 'book'
  | 'pad'
  | 'flame'
  | 'camera'
  | 'bolt'
  | 'spark'
  | 'note'
  | 'laugh'
  | 'boltnews'
  | 'plane'
  | 'ball'
  | 'wheel'
  | 'bag'
  | 'heart'
  | 'rise'
  | 'wrench'

export type Niche = {
  id: NicheId
  label: string
  hint: string
  group: string
  background: [string, string, string]
  accent: string
  panel: string
  ink: string
  muted: string
  badge: string
  shape: ShapeId
}

export const NICHES: Niche[] = [
  {
    id: 'tech',
    label: 'Tech & AI',
    hint: 'launches, reviews, explainers',
    group: 'Knowledge',
    background: ['#0B1220', '#15233A', '#1F3B5C'],
    accent: '#D6FF3C',
    panel: '#081018',
    ink: '#F4F7FB',
    muted: '#9BB0C9',
    badge: 'SHIPPED',
    shape: 'bars',
  },
  {
    id: 'education',
    label: 'Education',
    hint: 'courses, exams, tutorials',
    group: 'Knowledge',
    background: ['#1A1424', '#2A1F3D', '#3B2A57'],
    accent: '#FFB347',
    panel: '#120E1A',
    ink: '#F8F3FF',
    muted: '#B9A9D4',
    badge: 'CLASS',
    shape: 'book',
  },
  {
    id: 'news',
    label: 'News & Politics',
    hint: 'headlines, briefings, breakdowns',
    group: 'Knowledge',
    background: ['#101418', '#1C2730', '#2A3A48'],
    accent: '#5CC8FF',
    panel: '#0A0E12',
    ink: '#F2F7FB',
    muted: '#9BB0C0',
    badge: 'BREAKING',
    shape: 'boltnews',
  },
  {
    id: 'business',
    label: 'Business',
    hint: 'startups, ops, founder stories',
    group: 'Money',
    background: ['#12141A', '#1E2430', '#2C3648'],
    accent: '#F0C75E',
    panel: '#0C0E12',
    ink: '#FFF8E8',
    muted: '#C3B090',
    badge: 'GROWTH',
    shape: 'bag',
  },
  {
    id: 'finance',
    label: 'Finance',
    hint: 'markets, salary, investing',
    group: 'Money',
    background: ['#102018', '#163528', '#1F4A34'],
    accent: '#7CFFB2',
    panel: '#0A1610',
    ink: '#F2FFF8',
    muted: '#A6C7B5',
    badge: 'RUPEES',
    shape: 'coins',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    hint: 'clips, builds, ranked runs',
    group: 'Entertainment',
    background: ['#140B18', '#2A1030', '#4A1548'],
    accent: '#FF4D9A',
    panel: '#0C0610',
    ink: '#FFF1F8',
    muted: '#D2A5BE',
    badge: 'LIVE',
    shape: 'pad',
  },
  {
    id: 'comedy',
    label: 'Comedy',
    hint: 'skits, roast, reactions',
    group: 'Entertainment',
    background: ['#1A1208', '#3A2410', '#5A3A14'],
    accent: '#FFD84A',
    panel: '#120C06',
    ink: '#FFF8E8',
    muted: '#D6C08A',
    badge: 'SKIT',
    shape: 'laugh',
  },
  {
    id: 'music',
    label: 'Music',
    hint: 'covers, sessions, releases',
    group: 'Entertainment',
    background: ['#120816', '#28123A', '#3E1A58'],
    accent: '#C9A0FF',
    panel: '#0C0612',
    ink: '#F8F1FF',
    muted: '#C2A8DE',
    badge: 'SESSION',
    shape: 'note',
  },
  {
    id: 'vlog',
    label: 'Vlog & Lifestyle',
    hint: 'day in life, routines, stories',
    group: 'Lifestyle',
    background: ['#141816', '#243028', '#354438'],
    accent: '#9DFF8A',
    panel: '#0C100E',
    ink: '#F3FFF0',
    muted: '#B0C8A8',
    badge: 'VLOG',
    shape: 'camera',
  },
  {
    id: 'travel',
    label: 'Travel',
    hint: 'trips, city guides, packing',
    group: 'Lifestyle',
    background: ['#0E1A22', '#163244', '#214E66'],
    accent: '#4EE0C4',
    panel: '#081218',
    ink: '#EEFFFB',
    muted: '#9CC4BA',
    badge: 'TRIP',
    shape: 'plane',
  },
  {
    id: 'cooking',
    label: 'Food & Cooking',
    hint: 'recipes, street food, kitchen',
    group: 'Lifestyle',
    background: ['#1C120C', '#3A2114', '#5A3318'],
    accent: '#FF7A3D',
    panel: '#120B07',
    ink: '#FFF6F0',
    muted: '#D2B3A0',
    badge: 'RECIPE',
    shape: 'flame',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    hint: 'workouts, form, challenges',
    group: 'Lifestyle',
    background: ['#14100C', '#2A1C12', '#403018'],
    accent: '#FF6B4A',
    panel: '#0E0A08',
    ink: '#FFF4F0',
    muted: '#D2A898',
    badge: 'TRAIN',
    shape: 'bolt',
  },
  {
    id: 'beauty',
    label: 'Beauty & Fashion',
    hint: 'makeup, fits, routines',
    group: 'Lifestyle',
    background: ['#1A1018', '#322028', '#4A303C'],
    accent: '#FF8EC8',
    panel: '#120A10',
    ink: '#FFF0F7',
    muted: '#D8A8C0',
    badge: 'LOOK',
    shape: 'spark',
  },
  {
    id: 'parenting',
    label: 'Parenting',
    hint: 'kids, family tips, routines',
    group: 'Lifestyle',
    background: ['#16141C', '#282434', '#3A344C'],
    accent: '#FF9E7A',
    panel: '#100E14',
    ink: '#FFF5F0',
    muted: '#C8B0A4',
    badge: 'FAMILY',
    shape: 'heart',
  },
  {
    id: 'sports',
    label: 'Sports',
    hint: 'match recaps, analysis, clips',
    group: 'Action',
    background: ['#0C1810', '#143022', '#1E4832'],
    accent: '#6BFF8A',
    panel: '#08120C',
    ink: '#F0FFF4',
    muted: '#A0C8AC',
    badge: 'MATCH',
    shape: 'ball',
  },
  {
    id: 'autos',
    label: 'Autos & Vehicles',
    hint: 'reviews, mods, road trips',
    group: 'Action',
    background: ['#121416', '#222830', '#343C48'],
    accent: '#FF5A4A',
    panel: '#0C0E10',
    ink: '#FFF2F0',
    muted: '#C8A8A4',
    badge: 'DRIVE',
    shape: 'wheel',
  },
  {
    id: 'diy',
    label: 'DIY & How-to',
    hint: 'builds, repairs, makers',
    group: 'Action',
    background: ['#16120C', '#2C2418', '#443828'],
    accent: '#E8A85C',
    panel: '#100C08',
    ink: '#FFF8F0',
    muted: '#C8B090',
    badge: 'BUILD',
    shape: 'wrench',
  },
  {
    id: 'motivation',
    label: 'Motivation',
    hint: 'habits, mindset, career push',
    group: 'Action',
    background: ['#101828', '#182848', '#243868'],
    accent: '#6EC8FF',
    panel: '#0A101C',
    ink: '#F0F8FF',
    muted: '#A0B8D0',
    badge: 'DAY 1',
    shape: 'rise',
  },
]

export const WIDTH = 1280
export const HEIGHT = 720

export const NICHE_GROUPS = ['Knowledge', 'Money', 'Entertainment', 'Lifestyle', 'Action'] as const

export function getNiche(id: NicheId): Niche {
  return NICHES.find((niche) => niche.id === id) ?? NICHES[0]
}

export function filterNiches(query: string): Niche[] {
  const q = query.trim().toLowerCase()
  if (!q) return NICHES
  return NICHES.filter(
    (niche) =>
      niche.label.toLowerCase().includes(q) ||
      niche.hint.toLowerCase().includes(q) ||
      niche.group.toLowerCase().includes(q) ||
      niche.id.includes(q),
  )
}
