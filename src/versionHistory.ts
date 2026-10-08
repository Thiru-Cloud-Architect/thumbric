export type VersionSnapshot = {
  id: string
  ts: number
  label: string
  previewDataUrl: string
  title: string
}

const KEY = 'thumbric-versions-v1'
const MAX = 12

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadVersions(): VersionSnapshot[] {
  const raw = safeStorage()?.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as VersionSnapshot[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function pushVersion(entry: Omit<VersionSnapshot, 'id' | 'ts'>) {
  const list = loadVersions()
  const next: VersionSnapshot = {
    ...entry,
    id: Math.random().toString(36).slice(2, 10),
    ts: Date.now(),
  }
  list.unshift(next)
  safeStorage()?.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  return next
}

export function clearVersions() {
  safeStorage()?.removeItem(KEY)
}
