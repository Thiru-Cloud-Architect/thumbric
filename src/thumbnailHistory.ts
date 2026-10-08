export type HistoryEntry = {
  id: string
  ts: number
  title: string
  platform: string
  previewDataUrl: string
  clean: boolean
}

const KEY = 'thumbric-thumb-history-v1'
const MAX = 24

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadThumbnailHistory(): HistoryEntry[] {
  const raw = safeStorage()?.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as HistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function pushThumbnailHistory(entry: Omit<HistoryEntry, 'id' | 'ts'>) {
  const list = loadThumbnailHistory()
  const next: HistoryEntry = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    ts: Date.now(),
  }
  list.push(next)
  safeStorage()?.setItem(KEY, JSON.stringify(list.slice(-MAX)))
  return next
}

export function clearThumbnailHistory() {
  safeStorage()?.removeItem(KEY)
}
