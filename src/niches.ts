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

export type BackdropId = 'grid' | 'soft' | 'beam' | 'warm' | 'neon' | 'stripe'

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
  backdrop: BackdropId
}

export const NICHES: Niche[] = [
  {
    id: 'tech',
    label: 'Tech & AI',
    hint: 'Electric cyan + lime',
    group: 'Knowledge',
    background: ['#02040A', '#071428', '#0C2340'],
    accent: '#D6FF3C',
    panel: '#040810',
    ink: '#F4F7FB',
    muted: '#7FA8D4',
    badge: 'SHIPPED',
    shape: 'bars',
    backdrop: 'grid',
  },
  {
    id: 'education',
    label: 'Education',
    hint: 'Deep purple + gold',
    group: 'Knowledge',
    background: ['#180828', '#3A1268', '#5A2098'],
    accent: '#FFB020',
    panel: '#10041A',
    ink: '#FFF8F0',
    muted: '#D4B8FF',
    badge: 'CLASS',
    shape: 'book',
    backdrop: 'soft',
  },
  {
    id: 'news',
    label: 'News & Politics',
    hint: 'Ink black + alert red',
    group: 'Knowledge',
    background: ['#0A0A0A', '#141414', '#222222'],
    accent: '#FF453A',
    panel: '#050505',
    ink: '#FFFFFF',
    muted: '#B0B0B0',
    badge: 'BREAKING',
    shape: 'boltnews',
    backdrop: 'stripe',
  },
  {
    id: 'business',
    label: 'Business',
    hint: 'Navy suit + gold',
    group: 'Money',
    background: ['#0A1020', '#142848', '#1E3868'],
    accent: '#F5C842',
    panel: '#060A14',
    ink: '#FFF9E8',
    muted: '#A8B8D8',
    badge: 'GROWTH',
    shape: 'bag',
    backdrop: 'beam',
  },
  {
    id: 'finance',
    label: 'Finance',
    hint: 'Forest green + mint',
    group: 'Money',
    background: ['#021408', '#063018', '#0A4828'],
    accent: '#5CFFAA',
    panel: '#020E08',
    ink: '#E8FFF4',
    muted: '#88C8A8',
    badge: 'RUPEES',
    shape: 'coins',
    backdrop: 'grid',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    hint: 'Neon purple + pink',
    group: 'Entertainment',
    background: ['#0A0018', '#280040', '#500070'],
    accent: '#FF3DFF',
    panel: '#060010',
    ink: '#FFE8FF',
    muted: '#E090E0',
    badge: 'LIVE',
    shape: 'pad',
    backdrop: 'neon',
  },
  {
    id: 'comedy',
    label: 'Comedy',
    hint: 'Warm orange burst',
    group: 'Entertainment',
    background: ['#401800', '#803010', '#C04818'],
    accent: '#FFE44D',
    panel: '#281008',
    ink: '#FFF8E0',
    muted: '#FFD0A0',
    badge: 'SKIT',
    shape: 'laugh',
    backdrop: 'warm',
  },
  {
    id: 'music',
    label: 'Music',
    hint: 'Stage violet + lavender',
    group: 'Entertainment',
    background: ['#100020', '#300050', '#500080'],
    accent: '#C080FF',
    panel: '#0A0018',
    ink: '#F8EEFF',
    muted: '#D0A0FF',
    badge: 'SESSION',
    shape: 'note',
    backdrop: 'neon',
  },
  {
    id: 'vlog',
    label: 'Vlog & Lifestyle',
    hint: 'Sage green calm',
    group: 'Lifestyle',
    background: ['#142018', '#284030', '#3C6048'],
    accent: '#B8FF9A',
    panel: '#0C1810',
    ink: '#F0FFF0',
    muted: '#A0C8A0',
    badge: 'VLOG',
    shape: 'camera',
    backdrop: 'soft',
  },
  {
    id: 'travel',
    label: 'Travel',
    hint: 'Ocean teal + aqua',
    group: 'Lifestyle',
    background: ['#003840', '#006878', '#0098A8'],
    accent: '#7CFFF0',
    panel: '#002830',
    ink: '#E8FFFF',
    muted: '#90E0D8',
    badge: 'TRIP',
    shape: 'plane',
    backdrop: 'beam',
  },
  {
    id: 'cooking',
    label: 'Food & Cooking',
    hint: 'Terracotta kitchen',
    group: 'Lifestyle',
    background: ['#481008', '#882818', '#C84020'],
    accent: '#FFC040',
    panel: '#300808',
    ink: '#FFF4E8',
    muted: '#FFB890',
    badge: 'RECIPE',
    shape: 'flame',
    backdrop: 'warm',
  },
  {
    id: 'fitness',
    label: 'Fitness',
    hint: 'Charcoal + power red',
    group: 'Lifestyle',
    background: ['#180808', '#401010', '#681818'],
    accent: '#FF5030',
    panel: '#100606',
    ink: '#FFF0EC',
    muted: '#FF9880',
    badge: 'TRAIN',
    shape: 'bolt',
    backdrop: 'stripe',
  },
  {
    id: 'beauty',
    label: 'Beauty & Fashion',
    hint: 'Rose blush + pink',
    group: 'Lifestyle',
    background: ['#401028', '#702048', '#A03068'],
    accent: '#FFB0D8',
    panel: '#280818',
    ink: '#FFF0F8',
    muted: '#FFB0D0',
    badge: 'LOOK',
    shape: 'spark',
    backdrop: 'soft',
  },
  {
    id: 'parenting',
    label: 'Parenting',
    hint: 'Lavender + peach',
    group: 'Lifestyle',
    background: ['#302040', '#584878', '#8068A8'],
    accent: '#FFB890',
    panel: '#201830',
    ink: '#FFF8F4',
    muted: '#E8C8B0',
    badge: 'FAMILY',
    shape: 'heart',
    backdrop: 'soft',
  },
  {
    id: 'sports',
    label: 'Sports',
    hint: 'Turf green + white',
    group: 'Action',
    background: ['#082818', '#104830', '#186848'],
    accent: '#FFFFFF',
    panel: '#061810',
    ink: '#F0FFF4',
    muted: '#90D8A8',
    badge: 'MATCH',
    shape: 'ball',
    backdrop: 'stripe',
  },
  {
    id: 'autos',
    label: 'Autos & Vehicles',
    hint: 'Gunmetal + racing red',
    group: 'Action',
    background: ['#101418', '#283038', '#404850'],
    accent: '#FF3020',
    panel: '#0A0C10',
    ink: '#F0F4F8',
    muted: '#A0A8B0',
    badge: 'DRIVE',
    shape: 'wheel',
    backdrop: 'grid',
  },
  {
    id: 'diy',
    label: 'DIY & How-to',
    hint: 'Wood shop amber',
    group: 'Action',
    background: ['#301808', '#603018', '#904828'],
    accent: '#FFC060',
    panel: '#201008',
    ink: '#FFF8F0',
    muted: '#E8C090',
    badge: 'BUILD',
    shape: 'wrench',
    backdrop: 'warm',
  },
  {
    id: 'motivation',
    label: 'Motivation',
    hint: 'Sunrise blue gradient',
    group: 'Action',
    background: ['#081830', '#103060', '#184890'],
    accent: '#50D0FF',
    panel: '#061020',
    ink: '#F0F8FF',
    muted: '#90B8E0',
    badge: 'DAY 1',
    shape: 'rise',
    backdrop: 'beam',
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
