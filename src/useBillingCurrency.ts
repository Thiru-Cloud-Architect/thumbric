import { useCallback, useEffect, useState } from 'react'
import {
  GEO_TIMEOUT_MS,
  initialBillingCurrency,
  readStoredCurrency,
  resolveBillingCurrency,
  writeStoredCurrency,
} from './currency'
import type { BillingCurrency } from './plans'

export function useBillingCurrency() {
  const [currency, setCurrency] = useState<BillingCurrency>(initialBillingCurrency)

  useEffect(() => {
    if (readStoredCurrency()) return
    const controller = new AbortController()
    const timer = window.setTimeout(() => controller.abort(), GEO_TIMEOUT_MS)
    let active = true
    void resolveBillingCurrency(controller.signal).then((next) => {
      if (!active || readStoredCurrency()) return
      setCurrency(next)
    })
    return () => {
      active = false
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [])

  const chooseCurrency = useCallback((next: BillingCurrency) => {
    writeStoredCurrency(next)
    setCurrency(next)
  }, [])

  return { currency, chooseCurrency }
}
