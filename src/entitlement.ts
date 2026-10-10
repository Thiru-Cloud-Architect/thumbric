const STORAGE_KEY = 'thumbric-entitlement-v2'
const LEGACY_STORAGE_KEYS = [
  'thumbric-entitlement-v1',
  'thumbnailpulse-entitlement-v2',
  'thumbnailpulse-entitlement-v1',
  'thumbforge-entitlement-v1',
]

export const CREATOR_CLEAN_DOWNLOADS_PER_MONTH = 30
/** Guest + Free: taste of fal Pro imaging per calendar month. */
export const FREE_PRO_IMAGES_PER_MONTH = 3
/** Creator: enough for weekly uploads + regenerates (~20 full 3-look runs). */
export const CREATOR_PRO_IMAGES_PER_MONTH = 60
export const TRIAL_DAYS = 7
export const DEMO_PAID_DAYS = 30

export type PlanTier = 'free' | 'creator' | 'pro'

export type Entitlement = {
  email: string
  plan: PlanTier
  cleanDownloadsUsed: number
  /** Successful fal / Worker pro images used in the current quota month. */
  proImagesUsed: number
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
    proImagesUsed: 0,
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
    proImagesUsed: typeof raw.proImagesUsed === 'number' ? Math.max(0, Math.floor(raw.proImagesUsed)) : 0,
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
      proImagesUsed: 0,
      quotaPeriodStart: monthStart(now),
    }
  }

  const period = monthStart(now)
  if (base.quotaPeriodStart !== period) {
    return {
      ...base,
      cleanDownloadsUsed: base.plan === 'creator' ? 0 : base.cleanDownloadsUsed,
      proImagesUsed: 0,
      quotaPeriodStart: period,
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

/** Monthly fal/Worker image cap for the active plan. Infinity = Pro unlimited. */
export function proImageLimit(entitlement: Entitlement, now = Date.now()) {
  const ent = normalizeEntitlement(entitlement, now)
  if (isPaid(ent, now) && ent.plan === 'pro') return Number.POSITIVE_INFINITY
  if (isPaid(ent, now) && ent.plan === 'creator') return CREATOR_PRO_IMAGES_PER_MONTH
  return FREE_PRO_IMAGES_PER_MONTH
}

export function proImagesLeft(entitlement: Entitlement, now = Date.now()) {
  const ent = normalizeEntitlement(entitlement, now)
  const limit = proImageLimit(ent, now)
  if (!Number.isFinite(limit)) return Number.POSITIVE_INFINITY
  return Math.max(0, limit - ent.proImagesUsed)
}

export function canUseProImaging(entitlement: Entitlement, count = 1, now = Date.now()) {
  return proImagesLeft(entitlement, now) >= Math.max(1, count)
}

/** Spend successful pro image generations against this month’s quota. */
export function consumeProImages(entitlement: Entitlement, count: number): Entitlement {
  const ent = normalizeEntitlement(entitlement)
  const n = Math.max(0, Math.floor(count))
  if (n === 0) return ent
  if (!Number.isFinite(proImageLimit(ent))) return ent
  const next: Entitlement = {
    ...ent,
    proImagesUsed: ent.proImagesUsed + n,
  }
  saveEntitlement(next)
  return next
}

export function proImagingStatusLabel(entitlement: Entitlement, now = Date.now()) {
  const ent = normalizeEntitlement(entitlement, now)
  const left = proImagesLeft(ent, now)
  const limit = proImageLimit(ent, now)
  if (!Number.isFinite(limit)) {
    return ent.trial ? 'Pro imaging · unlimited (trial)' : 'Pro imaging · unlimited'
  }
  if (left <= 0) {
    return isPaid(ent, now) && ent.plan === 'creator'
      ? 'Pro imaging quota used — upgrade to Pro for unlimited'
      : 'Pro imaging quota used — free preview still works'
  }
  if (isPaid(ent, now) && ent.plan === 'creator') {
    return `Pro imaging · ${left} of ${limit} left this month`
  }
  return `Pro imaging · ${left} of ${limit} free this month`
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

/** A new free signup should not inherit an old demo Creator/Pro unlock. */
export function startFreeAccount(email: string): Entitlement {
  const next: Entitlement = {
    ...emptyEntitlement(),
    email: email.trim().toLowerCase(),
    plan: 'free',
    paidUntil: null,
    trial: false,
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
    proImagesUsed: 0,
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
  if (!ent.email) return 'Register free to save & download (5 mild marks / day)'
  if (!isPaid(ent, now)) {
    return 'Free plan — upgrade to Creator or Pro for clean (no-mark) exports'
  }
  if (ent.plan === 'pro') {
    return ent.trial ? 'Pro trial — unlimited clean downloads' : 'Pro — unlimited clean downloads'
  }
  const left = cleanDownloadsLeft(ent, now)
  if (ent.trial) {
    return `Creator trial — ${left} of ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads left`
  }
  return `Creator — ${left} of ${CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads left this month`
}
