import { beforeEach, describe, expect, it } from 'vitest'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  TRIAL_DAYS,
  activateDemoPlan,
  activateDemoTrial,
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

  it('requires registration and a paid plan before clean downloads', () => {
    const fresh = loadEntitlement()
    expect(canDownloadClean(fresh)).toBe(false)
    expect(cleanDownloadsLeft(fresh)).toBe(0)
  })

  it('gives creator quota after demo creator unlock', () => {
    expect(isValidEmail('bad')).toBe(false)
    expect(isValidEmail('you@email.com')).toBe(true)
    const registered = registerEmail('You@Email.com')
    expect(registered.email).toBe('you@email.com')
    expect(canDownloadClean(registered)).toBe(false)
    const creator = activateDemoPlan(registered, 'creator')
    expect(isPaid(creator)).toBe(true)
    expect(cleanDownloadsLeft(creator)).toBe(CREATOR_CLEAN_DOWNLOADS_PER_MONTH)
    const afterOne = consumeCleanDownload(creator)
    expect(cleanDownloadsLeft(afterOne)).toBe(CREATOR_CLEAN_DOWNLOADS_PER_MONTH - 1)
  })

  it('unlocks unlimited clean downloads on pro', () => {
    const registered = registerEmail('pay@email.com')
    const pro = activateDemoPlan(registered, 'pro')
    expect(isPaid(pro)).toBe(true)
    expect(cleanDownloadsLeft(pro)).toBe(Number.POSITIVE_INFINITY)
    const afterMany = consumeCleanDownload(consumeCleanDownload(pro))
    expect(cleanDownloadsLeft(afterMany)).toBe(Number.POSITIVE_INFINITY)
  })

  it('activates a 7-day creator trial demo', () => {
    const registered = registerEmail('trial@email.com')
    const trial = activateDemoTrial(registered)
    expect(trial.plan).toBe('creator')
    expect(trial.trial).toBe(true)
    expect(isPaid(trial)).toBe(true)
    expect(cleanDownloadsLeft(trial)).toBe(CREATOR_CLEAN_DOWNLOADS_PER_MONTH)
    const remainingMs = (trial.paidUntil ?? 0) - Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    expect(remainingMs).toBeGreaterThan((TRIAL_DAYS - 0.05) * dayMs)
    expect(remainingMs).toBeLessThanOrEqual(TRIAL_DAYS * dayMs)
  })
})
