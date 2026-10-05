const STORAGE_KEY = 'thumbforge-entitlement-v1'
export const FREE_CLEAN_DOWNLOADS = 2
export const PAID_PRICE_LABEL = '₹99 / month'

export type Entitlement = {
  email: string
  cleanDownloadsUsed: number
  paidUntil: number | null
}

function emptyEntitlement(): Entitlement {
  return { email: '', cleanDownloadsUsed: 0, paidUntil: null }
}

export function loadEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyEntitlement()
    const parsed = JSON.parse(raw) as Partial<Entitlement>
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      cleanDownloadsUsed:
        typeof parsed.cleanDownloadsUsed === 'number' ? parsed.cleanDownloadsUsed : 0,
      paidUntil: typeof parsed.paidUntil === 'number' ? parsed.paidUntil : null,
    }
  } catch {
    return emptyEntitlement()
  }
}

export function saveEntitlement(value: Entitlement) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function isPaid(entitlement: Entitlement, now = Date.now()) {
  return Boolean(entitlement.paidUntil && entitlement.paidUntil > now)
}

export function cleanDownloadsLeft(entitlement: Entitlement, now = Date.now()) {
  if (isPaid(entitlement, now)) return Number.POSITIVE_INFINITY
  if (!entitlement.email) return 0
  return Math.max(0, FREE_CLEAN_DOWNLOADS - entitlement.cleanDownloadsUsed)
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
  if (isPaid(entitlement)) return entitlement
  const next = {
    ...entitlement,
    cleanDownloadsUsed: entitlement.cleanDownloadsUsed + 1,
  }
  saveEntitlement(next)
  return next
}

/** Demo payment until Stripe is connected. Grants 30 days. */
export function activateDemoPayment(entitlement: Entitlement): Entitlement {
  const next = {
    ...entitlement,
    paidUntil: Date.now() + 30 * 24 * 60 * 60 * 1000,
  }
  saveEntitlement(next)
  return next
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}
