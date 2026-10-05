import { beforeEach, describe, expect, it } from 'vitest'
import {
  FREE_CLEAN_DOWNLOADS,
  activateDemoPayment,
  canDownloadClean,
  cleanDownloadsLeft,
  consumeCleanDownload,
  isPaid,
  isValidEmail,
  loadEntitlement,
  registerEmail,
} from './entitlement'

describe('entitlement', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('requires registration before clean downloads', () => {
    const fresh = loadEntitlement()
    expect(canDownloadClean(fresh)).toBe(false)
    expect(cleanDownloadsLeft(fresh)).toBe(0)
  })

  it('gives two free clean downloads after email registration', () => {
    expect(isValidEmail('bad')).toBe(false)
    expect(isValidEmail('you@email.com')).toBe(true)
    const registered = registerEmail('You@Email.com')
    expect(registered.email).toBe('you@email.com')
    expect(cleanDownloadsLeft(registered)).toBe(FREE_CLEAN_DOWNLOADS)
    const afterOne = consumeCleanDownload(registered)
    expect(cleanDownloadsLeft(afterOne)).toBe(FREE_CLEAN_DOWNLOADS - 1)
    const afterTwo = consumeCleanDownload(afterOne)
    expect(canDownloadClean(afterTwo)).toBe(false)
  })

  it('unlocks unlimited clean downloads after payment', () => {
    const registered = registerEmail('pay@email.com')
    const paid = activateDemoPayment(registered)
    expect(isPaid(paid)).toBe(true)
    expect(cleanDownloadsLeft(paid)).toBe(Number.POSITIVE_INFINITY)
  })
})
