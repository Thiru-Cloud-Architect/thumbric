import { beforeEach, describe, expect, it } from 'vitest'
import {
  FREE_DAILY_DOWNLOADS,
  FREE_DESIGN_CAP,
  canDownloadWatermarked,
  canStartDesign,
  consumeWatermarkDownload,
  designsLeft,
  loadDesignCount,
  recordDesignStarted,
  saveDesignCount,
  saveDailyDownloads,
  watermarkDownloadsLeftToday,
} from './usageLimits'

describe('usageLimits', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('caps guest designs and unlocks after register', () => {
    expect(canStartDesign(false)).toBe(true)
    for (let i = 0; i < FREE_DESIGN_CAP; i += 1) recordDesignStarted()
    expect(loadDesignCount()).toBe(FREE_DESIGN_CAP)
    expect(canStartDesign(false)).toBe(false)
    expect(designsLeft()).toBe(0)
    expect(canStartDesign(true)).toBe(true)
  })

  it('gives registered free users a daily watermarked download quota', () => {
    expect(canDownloadWatermarked(false, false)).toBe(false)
    expect(watermarkDownloadsLeftToday(true, false)).toBe(FREE_DAILY_DOWNLOADS)
    for (let i = 0; i < FREE_DAILY_DOWNLOADS; i += 1) {
      consumeWatermarkDownload(true, false)
    }
    expect(canDownloadWatermarked(true, false)).toBe(false)
    expect(canDownloadWatermarked(true, true)).toBe(true)
  })

  it('resets daily count when the day key changes', () => {
    saveDailyDownloads({ day: '2000-01-01', count: FREE_DAILY_DOWNLOADS })
    expect(watermarkDownloadsLeftToday(true, false)).toBe(FREE_DAILY_DOWNLOADS)
    saveDesignCount(3)
    expect(loadDesignCount()).toBe(3)
  })
})
