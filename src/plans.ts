import { CREATOR_CLEAN_DOWNLOADS_PER_MONTH, TRIAL_DAYS } from './entitlement'

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

/** Three public tiers only: Free · Creator · Pro */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Create, register, download lightly marked',
    usd: { amount: 0, compareAt: 0, symbol: '$' },
    inr: { amount: 0, compareAt: 0, symbol: '₹' },
    features: [
      '8 guest designs, then free register to continue',
      'Save projects after you register',
      '5 mild-watermark downloads / day',
      'AI Maker, Doctor, Score & Resizer',
    ],
    cta: 'Start free',
  },
  {
    id: 'creator',
    name: 'Creator',
    tagline: 'For weekly uploads',
    usd: { amount: 1, compareAt: 5, symbol: '$' },
    inr: { amount: 19, compareAt: 99, symbol: '₹' },
    highlight: `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean PNGs / month · includes ${TRIAL_DAYS}-day trial`,
    popular: true,
    features: [
      'Unlimited watermarked downloads',
      `${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean exports / month (no mark)`,
      'Cloud save when Supabase is connected',
      `${TRIAL_DAYS}-day trial unlock (demo until Stripe)`,
    ],
    cta: 'Get Creator',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Daily publishers',
    usd: { amount: 3, compareAt: 9, symbol: '$' },
    inr: { amount: 49, compareAt: 149, symbol: '₹' },
    highlight: 'Unlimited clean downloads',
    features: [
      'Everything in Creator',
      'Unlimited clean exports',
      'Priority when paid AI ships',
      `${TRIAL_DAYS}-day trial unlock available (demo)`,
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
  if (planId === 'free') return formatted
  return `${formatted} / month`
}
