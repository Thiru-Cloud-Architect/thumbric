export const SIMPLE_USER_STORAGE_KEY = 'thumbric-simple-user-v1'
const LOCAL_KEY = SIMPLE_USER_STORAGE_KEY

export type SimpleUser = {
  name: string
  email: string
  createdAt: string
}

export type RegisterSimpleUserResult = SimpleUser & {
  /** False when Worker cloud sync failed or was skipped — local account still works. */
  cloudSynced: boolean
  cloudNote?: string
}

function apiBase() {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined
  return (fromEnv || '').replace(/\/$/, '')
}

/** Pages deploys usually omit VITE_API_BASE — Sign in is localStorage only. */
export function simpleAuthIsDeviceOnly() {
  return !apiBase()
}

export function loadSimpleUser(): SimpleUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<SimpleUser>
    if (!parsed.email || !parsed.name) return null
    return {
      name: String(parsed.name),
      email: String(parsed.email).toLowerCase(),
      createdAt: parsed.createdAt || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveSimpleUserLocal(user: SimpleUser) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(user))
}

/**
 * Register / “login”: always save locally first.
 * Worker sync is best-effort — never block signup when KV/cloud is down.
 */
export async function registerSimpleUser(name: string, email: string): Promise<RegisterSimpleUserResult> {
  const user: SimpleUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  }
  if (!user.name || !user.email) {
    throw new Error('Name and email are required.')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    throw new Error('Enter a valid email.')
  }

  saveSimpleUserLocal(user)

  const base = apiBase()
  if (!base) {
    return { ...user, cloudSynced: false, cloudNote: 'Saved on this device.' }
  }

  try {
    const res = await fetch(`${base}/api/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (!res.ok) {
      return {
        ...user,
        cloudSynced: false,
        cloudNote: 'Account saved on this device. Cloud sync is unavailable right now.',
      }
    }
    const data = (await res.json().catch(() => ({}))) as { stored?: boolean }
    return {
      ...user,
      cloudSynced: data.stored !== false,
      cloudNote:
        data.stored === false
          ? 'Account saved on this device. Cloud sync is not configured yet.'
          : undefined,
    }
  } catch {
    return {
      ...user,
      cloudSynced: false,
      cloudNote: 'Account saved on this device. Could not reach the sync server.',
    }
  }
}

export function clearSimpleUser() {
  localStorage.removeItem(LOCAL_KEY)
}
