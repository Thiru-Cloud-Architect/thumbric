import { afterEach, describe, expect, it } from 'vitest'
import { captureAttribution, getOrCreateReferralId, loadAttribution, track } from './analytics'

afterEach(() => {
  localStorage.clear()
})

describe('attribution', () => {
  it('stores first-touch UTM and referral', () => {
    const loc = {
      search: '?utm_source=youtube&utm_medium=short&utm_campaign=roast&ref=abc123',
      pathname: '/youtube-thumbnail-score',
    } as Location
    const first = captureAttribution(loc)
    expect(first.source).toBe('youtube')
    expect(first.campaign).toBe('roast')
    expect(first.referralId).toBe('abc123')
    const again = captureAttribution({ search: '?utm_source=other', pathname: '/' } as Location)
    expect(again.source).toBe('youtube')
    expect(loadAttribution().campaign).toBe('roast')
  })
})

describe('events', () => {
  it('records named events in localStorage', () => {
    track('tool_started', { tool: 'score' })
    const raw = localStorage.getItem('thumbric-events-v1')
    expect(raw).toMatch(/tool_started/)
    expect(getOrCreateReferralId().length).toBeGreaterThan(4)
    expect(getOrCreateReferralId()).toBe(getOrCreateReferralId())
  })
})
