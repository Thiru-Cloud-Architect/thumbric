import { loadEvents, type AnalyticsEvent } from './analytics'

export type FunnelCounts = {
  landing: number
  toolStarted: number
  analyzed: number
  generated: number
  downloaded: number
  shared: number
  signupStarted: number
  signupCompleted: number
  returned: number
}

export function summarizeEvents(events: AnalyticsEvent[] = loadEvents()): FunnelCounts {
  const count = (name: string) => events.filter((e) => e.name === name).length
  return {
    landing: count('landing_page_view'),
    toolStarted: count('tool_started'),
    analyzed: count('thumbnail_analyzed'),
    generated: count('generation_completed'),
    downloaded: count('thumbnail_downloaded'),
    shared: count('thumbnail_shared'),
    signupStarted: count('signup_started'),
    signupCompleted: count('signup_completed'),
    returned: count('user_returned'),
  }
}

export function eventsByDay(events: AnalyticsEvent[] = loadEvents()) {
  const map = new Map<string, number>()
  for (const event of events) {
    const day = new Date(event.ts).toISOString().slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
}
