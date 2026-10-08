export type ProjectStatus = 'draft' | 'exported' | 'analyzed'

export type Project = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  previewDataUrl: string
  title: string
  platform: string
  score?: number
  status: ProjectStatus
  variants: number
}

const KEY = 'thumbric-projects-v1'
const MAX = 40

function safeStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadProjects(): Project[] {
  const raw = safeStorage()?.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as Project[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(list: Project[]) {
  safeStorage()?.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}

export function upsertProject(partial: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const list = loadProjects()
  const now = Date.now()
  if (partial.id) {
    const idx = list.findIndex((p) => p.id === partial.id)
    if (idx >= 0) {
      const next = { ...list[idx]!, ...partial, updatedAt: now }
      list[idx] = next
      persist(list)
      return next
    }
  }
  const project: Project = {
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
    name: partial.name,
    previewDataUrl: partial.previewDataUrl,
    title: partial.title,
    platform: partial.platform,
    score: partial.score,
    status: partial.status,
    variants: partial.variants,
  }
  list.unshift(project)
  persist(list)
  return project
}

export function duplicateProject(id: string) {
  const list = loadProjects()
  const found = list.find((p) => p.id === id)
  if (!found) return null
  return upsertProject({
    name: `${found.name} (copy)`,
    previewDataUrl: found.previewDataUrl,
    title: found.title,
    platform: found.platform,
    score: found.score,
    status: 'draft',
    variants: found.variants,
  })
}

export function deleteProject(id: string) {
  persist(loadProjects().filter((p) => p.id !== id))
}
