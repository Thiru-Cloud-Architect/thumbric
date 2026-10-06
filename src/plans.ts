import { FREE_CLEAN_DOWNLOADS, PAID_PRICE_LABEL } from './entitlement'

export type PlanId = 'free' | 'creator' | 'pro'

export type Plan = {
  id: PlanId
  name: string
  tagline: string
  priceInr: number
  priceLabel: string
  compareAtLabel?: string
  highlight?: string
  popular?: boolean
  features: string[]
  cta: string
  ctaHref: string
}

/** ~1/5 of typical $15–25/mo AI thumbnail tools — tuned for India-first pricing. */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try everything in the editor',
    priceInr: 0,
    priceLabel: '₹0',
    features: [
      'Unlimited preview downloads (watermarked)',
      'All platforms & moods',
      'Quick idea & templates',
      'Drag text and stickers',
    ],
    cta: 'Start free',
    ctaHref: '#editor',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For weekly uploads',
    priceInr: 49,
    priceLabel: '₹49',
    compareAtLabel: '₹249',
    highlight: `${FREE_CLEAN_DOWNLOADS} clean downloads after signup`,
    features: [
      'Everything in Free',
      `${FREE_CLEAN_DOWNLOADS} clean PNGs (no watermark)`,
      'Email support',
      'Early access to new moods',
    ],
    cta: 'Register & try clean',
    ctaHref: '#editor',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Daily publishers & teams',
    priceInr: 99,
    priceLabel: '₹99',
    compareAtLabel: '₹499',
    popular: true,
    highlight: 'Unlimited clean downloads',
    features: [
      'Everything in Creator',
      'Unlimited clean exports',
      'Priority when we add AI assists',
      'Same price as our current demo unlock',
    ],
    cta: 'Go Pro',
    ctaHref: '#editor',
  },
]

export const PRO_PLAN_LABEL = PAID_PRICE_LABEL
