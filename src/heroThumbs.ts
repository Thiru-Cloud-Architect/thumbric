/** Curated Unsplash portraits — plush “real thumbnail” feel in the hero (no API keys). */
export type HeroThumb = {
  id: string
  image: string
  tag: string
  headline: string
  hue: number
}

export const HERO_THUMBS: HeroThumb[] = [
  {
    id: 'a',
    tag: 'NEW',
    headline: 'I tried this for 30 days',
    hue: 330,
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'b',
    tag: 'WOW',
    headline: 'They said it was impossible',
    hue: 260,
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'c',
    tag: 'FIX',
    headline: 'Stop doing this wrong',
    hue: 195,
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'd',
    tag: 'HOT',
    headline: 'Earn more on autopilot',
    hue: 45,
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'e',
    tag: 'AI',
    headline: 'Built in one weekend',
    hue: 280,
    image:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'f',
    tag: 'TRIP',
    headline: '48 hours in Chennai',
    hue: 160,
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'g',
    tag: 'PR',
    headline: 'Production PR review',
    hue: 15,
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=640&h=360&fit=crop&q=80',
  },
  {
    id: 'h',
    tag: 'GO',
    headline: 'Watch before you buy',
    hue: 220,
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&h=360&fit=crop&q=80',
  },
]
