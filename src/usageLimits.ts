/**
 * Freemium limits — product idea:
 *
 * Guest: create up to FREE_DESIGN_CAP designs in this browser.
 * Register (free): unlock saves + FREE_DAILY_DOWNLOADS mild-watermarked PNGs / day.
 * Creator: unlimited watermarked + CREATOR_CLEAN_DOWNLOADS_PER_MONTH clean PNGs.
 * Pro: unlimited clean exports.
 */

export const FREE_DESIGN_CAP = 8
export const FREE_DAILY_DOWNLOADS = 5

const DESIGN_KEY = 'thumbric-design-count-v1'
const DAILY_KEY = 'thumbric-daily-downloads-v1'

export type DailyDownloadState = {
  day: string
  count: number
}

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function loadDesignCount(): number {
  try {
    const n = Number(localStorage.getItem(DESIGN_KEY) || '0')
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  } catch {
    return 0
  }
}

export function saveDesignCount(count: number) {
  localStorage.setItem(DESIGN_KEY, String(Math.max(0, Math.floor(count))))
}

/** Call when the user starts a new design (template, photo, or AI finish). */
export function recordDesignStarted(): number {
  const next = loadDesignCount() + 1
  saveDesignCount(next)
  return next
}

export function designsLeft(cap = FREE_DESIGN_CAP) {
  return Math.max(0, cap - loadDesignCount())
}

export function canStartDesign(isRegistered: boolean, cap = FREE_DESIGN_CAP) {
  if (isRegistered) return true
  return loadDesignCount() < cap
}

export function loadDailyDownloads(now = new Date()): DailyDownloadState {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (!raw) return { day: todayKey(now), count: 0 }
    const parsed = JSON.parse(raw) as Partial<DailyDownloadState>
    const day = typeof parsed.day === 'string' ? parsed.day : todayKey(now)
    const count = typeof parsed.count === 'number' ? parsed.count : 0
    if (day !== todayKey(now)) return { day: todayKey(now), count: 0 }
    return { day, count: Math.max(0, Math.floor(count)) }
  } catch {
    return { day: todayKey(now), count: 0 }
  }
}

export function saveDailyDownloads(state: DailyDownloadState) {
  localStorage.setItem(DAILY_KEY, JSON.stringify(state))
}

export function watermarkDownloadsLeftToday(
  isRegistered: boolean,
  isPaidPlan: boolean,
  dailyCap = FREE_DAILY_DOWNLOADS,
  now = new Date(),
) {
  if (isPaidPlan) return Number.POSITIVE_INFINITY
  if (!isRegistered) return 0
  const state = loadDailyDownloads(now)
  return Math.max(0, dailyCap - state.count)
}

export function canDownloadWatermarked(
  isRegistered: boolean,
  isPaidPlan: boolean,
  dailyCap = FREE_DAILY_DOWNLOADS,
  now = new Date(),
) {
  return watermarkDownloadsLeftToday(isRegistered, isPaidPlan, dailyCap, now) > 0
}

export function consumeWatermarkDownload(
  isRegistered: boolean,
  isPaidPlan: boolean,
  dailyCap = FREE_DAILY_DOWNLOADS,
  now = new Date(),
): DailyDownloadState {
  const state = loadDailyDownloads(now)
  if (isPaidPlan || !isRegistered) return state
  if (state.count >= dailyCap) return state
  const next = { day: todayKey(now), count: state.count + 1 }
  saveDailyDownloads(next)
  return next
}

export function freemiumStatusLabel(opts: {
  isRegistered: boolean
  isPaid: boolean
  planLabel?: string
  dailyCap?: number
  designCap?: number
}) {
  const dailyCap = opts.dailyCap ?? FREE_DAILY_DOWNLOADS
  const designCap = opts.designCap ?? FREE_DESIGN_CAP
  if (opts.isPaid) return opts.planLabel || 'Paid plan active'
  if (!opts.isRegistered) {
    const left = designsLeft(designCap)
    return `Guest · ${left} of ${designCap} free designs left · register to save & download`
  }
  const dl = watermarkDownloadsLeftToday(true, false, dailyCap)
  return `Free · ${dl} of ${dailyCap} watermarked downloads left today`
}
