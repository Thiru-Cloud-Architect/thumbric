export const SIMPLE_USER_STORAGE_KEY = 'thumbric-simple-user-v1'
const LOCAL_KEY = SIMPLE_USER_STORAGE_KEY

export type SimpleUser = {
  name: string
  email: string
  createdAt: string
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

/** Register / “login”: always save locally; sync to Worker JSON when VITE_API_BASE is set. */
export async function registerSimpleUser(name: string, email: string): Promise<SimpleUser> {
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
  if (base) {
    const res = await fetch(`${base}/api/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(user),
    })
    if (!res.ok) {
      throw new Error('Saved on this device. Cloud sync is not available yet.')
    }
  }

  return user
}

export function clearSimpleUser() {
  localStorage.removeItem(LOCAL_KEY)
}
