import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH, TRIAL_DAYS } from './entitlement'

export type PlanId = 'free' | 'trial' | 'creator' | 'pro'
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
    id: 'trial',
    name: '7-day Trial',
    tagline: 'Creator clean exports — no card yet',
    usd: { amount: 0, compareAt: 19, symbol: '$' },
    inr: { amount: 0, compareAt: 999, symbol: '₹' },
    highlight: `${TRIAL_DAYS}-day Creator trial in this browser`,
    popular: true,
    features: [
      'Everything in Free',
      `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs (Creator quota) during the trial`,
      'Demo unlock stored locally — payments come later',
      'Then continue on Creator or Pro when you are ready',
    ],
    cta: 'Start 7-day free trial',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For weekly uploads',
    usd: { amount: 19, compareAt: 39, symbol: '$' },
    inr: { amount: 999, compareAt: 1999, symbol: '₹' },
    highlight: `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs every month`,
    features: [
      'Everything in Free',
      `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean exports per month (no watermark)`,
      'Email support',
      'Early access to new moods',
      `Includes a ${TRIAL_DAYS}-day free trial unlock (demo)`,
    ],
    cta: 'Get Creator',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Daily publishers & teams',
    usd: { amount: 49, compareAt: 99, symbol: '$' },
    inr: { amount: 2499, compareAt: 4999, symbol: '₹' },
    highlight: 'Unlimited clean downloads',
    features: [
      'Everything in Creator',
      'Unlimited clean exports',
      'Priority when we add AI assists',
      'Team-friendly — one price, many uploads',
      `Includes a ${TRIAL_DAYS}-day free trial unlock (demo)`,
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
  if (planId === 'free' || planId === 'trial') return formatted
  return `${formatted} / month`
}
