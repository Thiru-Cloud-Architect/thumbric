export type NicheId = 'tech' | 'finance' | 'education' | 'gaming' | 'cooking'

export type Niche = {
  id: NicheId
  label: string
  hint: string
  background: [string, string, string]
  accent: string
  panel: string
  ink: string
  muted: string
  badge: string
  shape: 'bars' | 'coins' | 'book' | 'pad' | 'flame'
}

export const NICHES: Niche[] = [
  {
    id: 'tech',
    label: 'Tech',
    hint: 'launches, reviews, AI explainers',
    background: ['#0B1220', '#15233A', '#1F3B5C'],
    accent: '#D6FF3C',
    panel: '#081018',
    ink: '#F4F7FB',
    muted: '#9BB0C9',
    badge: 'SHIPPED',
    shape: 'bars',
  },
  {
    id: 'finance',
    label: 'Finance',
    hint: 'markets, salary, side income',
    background: ['#102018', '#163528', '#1F4A34'],
    accent: '#7CFFB2',
    panel: '#0A1610',
    ink: '#F2FFF8',
    muted: '#A6C7B5',
    badge: 'RUPEES',
    shape: 'coins',
  },
  {
    id: 'education',
    label: 'Education',
    hint: 'courses, exams, how-to',
    background: ['#1A1424', '#2A1F3D', '#3B2A57'],
    accent: '#FFB347',
    panel: '#120E1A',
    ink: '#F8F3FF',
    muted: '#B9A9D4',
    badge: 'CLASS',
    shape: 'book',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    hint: 'clips, builds, ranked runs',
    background: ['#140B18', '#2A1030', '#4A1548'],
    accent: '#FF4D9A',
    panel: '#0C0610',
    ink: '#FFF1F8',
    muted: '#D2A5BE',
    badge: 'LIVE',
    shape: 'pad',
  },
  {
    id: 'cooking',
    label: 'Cooking',
    hint: 'recipes, street food, kitchen tips',
    background: ['#1C120C', '#3A2114', '#5A3318'],
    accent: '#FF7A3D',
    panel: '#120B07',
    ink: '#FFF6F0',
    muted: '#D2B3A0',
    badge: 'RECIPE',
    shape: 'flame',
  },
]

export const WIDTH = 1280
export const HEIGHT = 720

export function getNiche(id: NicheId): Niche {
  return NICHES.find((niche) => niche.id === id) ?? NICHES[0]
}
