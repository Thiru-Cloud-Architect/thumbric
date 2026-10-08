import { describe, expect, it } from 'vitest'
import { currencyForCountry } from './currency'

describe('currencyForCountry', () => {
  it('uses INR for India', () => {
    expect(currencyForCountry('IN', 'America/New_York')).toBe('INR')
  })

  it('uses USD for other countries', () => {
    expect(currencyForCountry('US', 'America/New_York')).toBe('USD')
  })

  it('falls back to INR for Asia/Kolkata when the country is unknown', () => {
    expect(currencyForCountry(null, 'Asia/Kolkata')).toBe('INR')
  })

  it('falls back to USD for other timezones when the country is unknown', () => {
    expect(currencyForCountry(null, 'America/New_York')).toBe('USD')
  })
})
