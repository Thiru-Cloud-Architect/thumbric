import { apiBaseUrl } from './aiConfig'

export type AnalyticsEventName =
  | 'landing_page_view'
  | 'tool_started'
  | 'thumbnail_uploaded'
  | 'thumbnail_analyzed'
  | 'thumbnail_generated'
  | 'generation_completed'
  | 'generation_failed'
  | 'thumbnail_downloaded'
  | 'thumbnail_shared'
  | 'result_page_created'
  | 'signup_started'
  | 'signup_completed'
  | 'subscription_started'
  | 'subscription_completed'
  | 'user_returned'
  | 'cta_click'
  | 'ab_test_created'
  | 'doctor_started'
  | 'doctor_completed'
  | 'project_duplicated'
  | 'project_deleted'
  | 'bug_report_submitted'
  | 'feature_request_submitted'
  | 'mobile_preview_used'
  | 'concept_selected'

export type Attribution = {
  source: string
  medium: string
  campaign: string
  content: string
  term: string
  referralId: string
  landing: string
}

export type AnalyticsEvent = {
  name: AnalyticsEventName | string
  ts: number
  props: Record<string, string | number | boolean | null>
}

const ATTR_KEY = 'thumbric-attr-v1'
const EVENTS_KEY = 'thumbric-events-v1'
const REF_KEY = 'thumbric-ref-id-v1'
const SESSION_KEY = 'thumbric-session-seen-v1'
const MAX_EVENTS = 200

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getOrCreateReferralId() {
  const storage = safeStorage()
  const existing = storage?.getItem(REF_KEY)
  if (existing) return existing
  const id = Math.random().toString(36).slice(2, 10)
  storage?.setItem(REF_KEY, id)
  return id
}

export function referralUrl(siteUrl: string) {
  const base = siteUrl.replace(/\/?$/, '/')
  return `${base}?ref=${getOrCreateReferralId()}`
}

function emptyAttribution(): Attribution {
  return {
    source: 'direct',
    medium: 'none',
    campaign: '',
    content: '',
    term: '',
    referralId: '',
    landing: '/',
  }
}

export function loadAttribution(): Attribution {
  const storage = safeStorage()
  try {
    const raw = storage?.getItem(ATTR_KEY)
    if (!raw) return emptyAttribution()
    const parsed = JSON.parse(raw) as Partial<Attribution>
    return { ...emptyAttribution(), ...parsed }
  } catch {
    return emptyAttribution()
  }
}

function guessSource(referrer: string) {
  if (!referrer) return 'direct'
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '')
    if (host.includes('youtube') || host.includes('youtu.be')) return 'youtube'
    if (host.includes('instagram')) return 'instagram'
    if (host.includes('reddit')) return 'reddit'
    if (host.includes('linkedin')) return 'linkedin'
    if (host.includes('twitter') || host.includes('x.com')) return 'x'
    if (host.includes('facebook') || host.includes('fb.')) return 'facebook'
    if (host.includes('google')) return 'google organic'
    return 'referral'
  } catch {
    return 'referral'
  }
}

/** First-touch UTM / ref capture. Later visits keep the original source. */
export function captureAttribution(location: Location = window.location): Attribution {
  const storage = safeStorage()
  const existingRaw = storage?.getItem(ATTR_KEY)
  if (existingRaw) {
    try {
      return JSON.parse(existingRaw) as Attribution
    } catch {
      /* fall through */
    }
  }

  const params = new URLSearchParams(location.search)
  const referralId = params.get('ref') || params.get('via') || ''
  const utmSource = params.get('utm_source') || ''
  const referrer = typeof document !== 'undefined' ? document.referrer : ''
  const attr: Attribution = {
    source: utmSource || (referralId ? 'referral' : guessSource(referrer)),
    medium: params.get('utm_medium') || (referralId ? 'referral' : utmSource ? 'campaign' : 'none'),
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
    referralId,
    landing: `${location.pathname}${location.search}` || '/',
  }
  storage?.setItem(ATTR_KEY, JSON.stringify(attr))
  return attr
}

export function loadEvents(): AnalyticsEvent[] {
  const storage = safeStorage()
  try {
    const raw = storage?.getItem(EVENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AnalyticsEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistEvents(events: AnalyticsEvent[]) {
  safeStorage()?.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

function sendToWorker(event: AnalyticsEvent) {
  const base = apiBaseUrl()
  if (!base || typeof fetch !== 'function') return
  const body = JSON.stringify(event)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(`${base}/api/events`, blob)
      return
    }
  } catch {
    /* fall through */
  }
  void fetch(`${base}/api/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined)
}

export function track(
  name: AnalyticsEventName | string,
  props: Record<string, string | number | boolean | null> = {},
) {
  const attr = loadAttribution()
  const event: AnalyticsEvent = {
    name,
    ts: Date.now(),
    props: {
      source: attr.source,
      campaign: attr.campaign,
      landing: attr.landing,
      referralId: attr.referralId,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      ...props,
    },
  }
  const events = loadEvents()
  events.push(event)
  persistEvents(events)
  sendToWorker(event)
  return event
}

export function markReturnVisit() {
  const storage = safeStorage()
  if (!storage) return false
  if (storage.getItem(SESSION_KEY)) return false
  const events = loadEvents()
  const generated = events.some(
    (item) => item.name === 'generation_completed' || item.name === 'thumbnail_downloaded',
  )
  storage.setItem(SESSION_KEY, '1')
  if (generated) {
    track('user_returned', { device: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : '' })
    return true
  }
  return false
}
