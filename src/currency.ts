import type { BillingCurrency } from './plans'

/** Visitor override. Geo detection must not replace a saved choice. */
export const CURRENCY_STORAGE_KEY = 'thumbric-currency'

export const GEO_TIMEOUT_MS = 2500

const GEO_URL = 'https://ipwho.is/'

/**
 * India (country IN) uses INR. Any other known country uses USD.
 * When the country is unknown, Asia/Kolkata and Asia/Calcutta use INR.
 */
export function currencyForCountry(code: string | null, timeZone: string): BillingCurrency {
  const normalized = code?.trim().toUpperCase() ?? ''
  if (normalized) return normalized === 'IN' ? 'INR' : 'USD'
  if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') return 'INR'
  return 'USD'
}

export function currentTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

export function readStoredCurrency(): BillingCurrency | null {
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw === 'USD' || raw === 'INR') return raw
  } catch {
    /* private mode or unavailable storage */
  }
  return null
}

export function writeStoredCurrency(currency: BillingCurrency) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  } catch {
    /* ignore quota / private mode */
  }
}

/** First paint before the geo request returns: saved choice, else timezone. */
export function initialBillingCurrency(): BillingCurrency {
  return readStoredCurrency() ?? currencyForCountry(null, currentTimeZone())
}

type GeoPayload = {
  success?: boolean
  country_code?: string
}

export async function lookupCountryCode(signal: AbortSignal): Promise<string | null> {
  const response = await fetch(GEO_URL, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) return null
  const data = (await response.json()) as GeoPayload
  if (data.success === false) return null
  const code = data.country_code?.trim()
  return code || null
}

/** Saved choice wins. Otherwise country from ipwho.is, then timezone if that request fails. */
export async function resolveBillingCurrency(signal: AbortSignal): Promise<BillingCurrency> {
  const stored = readStoredCurrency()
  if (stored) return stored
  const timeZone = currentTimeZone()
  try {
    const code = await lookupCountryCode(signal)
    return readStoredCurrency() ?? currencyForCountry(code, timeZone)
  } catch {
    return readStoredCurrency() ?? currencyForCountry(null, timeZone)
  }
}
