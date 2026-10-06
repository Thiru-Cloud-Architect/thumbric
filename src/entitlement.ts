const STORAGE_KEY = 'thumbric-entitlement-v2'
const LEGACY_STORAGE_KEYS = [
  'thumbric-entitlement-v1',
  'thumbnailpulse-entitlement-v2',
  'thumbnailpulse-entitlement-v1',
  'thumbforge-entitlement-v1',
]

export const CREATOR_CLEAN_DOWNLOADS_PER_MONTH = 9
export const TRIAL_DAYS = 7
export const DEMO_PAID_DAYS = 30

export type PlanTier = 'free' | 'creator' | 'pro'

export type Entitlement = {
  email: string
  plan: PlanTier
  cleanDownloadsUsed: number
  quotaPeriodStart: number
  paidUntil: number | null
  /** True when the current unlock came from the 7-day trial demo. */
  trial?: boolean
}

function emptyEntitlement(): Entitlement {
  const now = Date.now()
  return {
    email: '',
    plan: 'free',
    cleanDownloadsUsed: 0,
    quotaPeriodStart: monthStart(now),
    paidUntil: null,
    trial: false,
  }
}

function monthStart(nowMs: number) {
  const d = new Date(nowMs)
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime()
}

function normalizeEntitlement(raw: Partial<Entitlement>, now = Date.now()): Entitlement {
  const base: Entitlement = {
    email: typeof raw.email === 'string' ? raw.email : '',
    plan:
      raw.plan === 'creator' || raw.plan === 'pro' || raw.plan === 'free' ? raw.plan : 'free',
    cleanDownloadsUsed:
      typeof raw.cleanDownloadsUsed === 'number' ? raw.cleanDownloadsUsed : 0,
    quotaPeriodStart:
      typeof raw.quotaPeriodStart === 'number' ? raw.quotaPeriodStart : monthStart(now),
    paidUntil: typeof raw.paidUntil === 'number' ? raw.paidUntil : null,
    trial: Boolean(raw.trial),
  }

  if (base.paidUntil && base.paidUntil > now && base.plan === 'free') {
    base.plan = 'pro'
  }

  if (base.paidUntil && base.paidUntil <= now) {
    return {
      ...base,
      plan: 'free',
      paidUntil: null,
      trial: false,
      cleanDownloadsUsed: 0,
      quotaPeriodStart: monthStart(now),
    }
  }

  if (base.plan === 'creator' && base.quotaPeriodStart !== monthStart(now)) {
    return {
      ...base,
      cleanDownloadsUsed: 0,
      quotaPeriodStart: monthStart(now),
    }
  }

  return base
}

export function loadEntitlement(): Entitlement {
  try {
    let raw: string | null = null
    for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
      raw = localStorage.getItem(key)
      if (raw) break
    }
    if (!raw) return emptyEntitlement()
    const parsed = JSON.parse(raw) as Partial<Entitlement>
    const next = normalizeEntitlement(parsed)
    saveEntitlement(next)
    return next
  } catch {
    return emptyEntitlement()
  }
}

export function saveEntitlement(value: Entitlement) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function isPaid(entitlement: Entitlement, now = Date.now()) {
  return Boolean(
    entitlement.paidUntil &&
      entitlement.paidUntil > now &&
      (entitlement.plan === 'creator' || entitlement.plan === 'pro'),
  )
}

export function cleanDownloadsLeft(entitlement: Entitlement, now = Date.now()) {
  const ent = normalizeEntitlement(entitlement, now)
  if (!ent.email) return 0
  if (!isPaid(ent, now)) return 0
  if (ent.plan === 'pro') return Number.POSITIVE_INFINITY
  if (ent.plan === 'creator') {
    return Math.max(0, CREATOR_CLEAN_DOWNLOADS_PER_MONTH - ent.cleanDownloadsUsed)
  }
  return 0
}

export function canDownloadClean(entitlement: Entitlement, now = Date.now()) {
  return cleanDownloadsLeft(entitlement, now) > 0
}

export function registerEmail(email: string): Entitlement {
  const current = loadEntitlement()
  const next: Entitlement = {
    ...current,
    email: email.trim().toLowerCase(),
  }
  saveEntitlement(next)
  return next
}

export function consumeCleanDownload(entitlement: Entitlement): Entitlement {
  const ent = normalizeEntitlement(entitlement)
  if (!isPaid(ent)) return ent
  if (ent.plan === 'pro') return ent
  const next = {
    ...ent,
    cleanDownloadsUsed: ent.cleanDownloadsUsed + 1,
  }
  saveEntitlement(next)
  return next
}

/** Demo checkout until Stripe is connected. Grants `days` on the selected tier. */
export function activateDemoPlan(
  entitlement: Entitlement,
  plan: Exclude<PlanTier, 'free'>,
  days: number = DEMO_PAID_DAYS,
): Entitlement {
  const now = Date.now()
  const next: Entitlement = {
    ...entitlement,
    plan,
    paidUntil: now + days * 24 * 60 * 60 * 1000,
    cleanDownloadsUsed: 0,
    quotaPeriodStart: monthStart(now),
    trial: days <= TRIAL_DAYS,
  }
  saveEntitlement(next)
  return next
}

/** 7-day Creator trial unlock (localStorage demo — payments come later). */
export function activateDemoTrial(entitlement: Entitlement): Entitlement {
  return activateDemoPlan(entitlement, 'creator', TRIAL_DAYS)
}

/** @deprecated Use activateDemoPlan(ent, 'pro') */
export function activateDemoPayment(entitlement: Entitlement): Entitlement {
  return activateDemoPlan(entitlement, 'pro')
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function entitlementStatusLabel(entitlement: Entitlement, now = Date.now()) {
  const ent = normalizeEntitlement(entitlement, now)
  if (!ent.email) return 'Register to unlock clean exports'
  if (!isPaid(ent, now)) return 'Choose Creator, Pro, or the 7-day trial on the pricing page'
  if (ent.plan === 'pro') {
    return ent.trial ? 'Pro trial — unlimited clean downloads' : 'Pro — unlimited clean downloads'
  }
  const left = cleanDownloadsLeft(ent, now)
  if (ent.trial) {
    return `Creator trial — ${left} of ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads left`
  }
  return `Creator — ${left} of ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads left this month`
}
