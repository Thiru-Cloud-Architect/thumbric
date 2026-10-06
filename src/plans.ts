import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH } from './entitlement'

export type PlanId = 'free' | 'creator' | 'pro'
export type BillingCurrency = 'USD' | 'INR'

export type PlanPricing = {
  amount: number
  compareAt: number
  symbol: string
}

export type Plan = {
  id: PlanId
  name: string
  tagline: string
  usd: PlanPricing
  inr: PlanPricing
  highlight?: string
  popular?: boolean
  features: string[]
  cta: string
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Try everything in the editor',
    usd: { amount: 0, compareAt: 0, symbol: '$' },
    inr: { amount: 0, compareAt: 0, symbol: '₹' },
    features: [
      'Unlimited preview downloads (watermarked)',
      'All platforms & moods',
      'Quick idea & templates',
      'Drag text and stickers',
    ],
    cta: 'Start free',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For weekly uploads',
    usd: { amount: 1, compareAt: 9, symbol: '$' },
    inr: { amount: 49, compareAt: 249, symbol: '₹' },
    highlight: `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs every month`,
    features: [
      'Everything in Free',
      `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean exports per month (no watermark)`,
      'Email support',
      'Early access to new moods',
    ],
    cta: 'Get Creator',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Daily publishers & teams',
    usd: { amount: 9, compareAt: 29, symbol: '$' },
    inr: { amount: 499, compareAt: 999, symbol: '₹' },
    popular: true,
    highlight: 'Unlimited clean downloads',
    features: [
      'Everything in Creator',
      'Unlimited clean exports',
      'Priority when we add AI assists',
      'Team-friendly — one price, many uploads',
    ],
    cta: 'Go Pro',
  },
]

export function formatPlanPrice(plan: Plan, currency: BillingCurrency) {
  const tier = currency === 'INR' ? plan.inr : plan.usd
  if (tier.amount === 0) {
    return `${tier.symbol}0`
  }
  const whole = currency === 'USD' ? tier.amount.toFixed(0) : String(tier.amount)
  return `${tier.symbol}${whole}`
}

export function formatCompareAt(plan: Plan, currency: BillingCurrency) {
  const tier = currency === 'INR' ? plan.inr : plan.usd
  if (tier.compareAt <= tier.amount) return null
  const whole = currency === 'USD' ? tier.compareAt.toFixed(0) : String(tier.compareAt)
  return `${tier.symbol}${whole}`
}

export function planPriceLabel(planId: PlanId, currency: BillingCurrency = 'USD') {
  const plan = PLANS.find((item) => item.id === planId)
  if (!plan) return ''
  const formatted = formatPlanPrice(plan, currency)
  return planId === 'free' ? formatted : `${formatted} / month`
}
