import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  SIMPLE_USER_STORAGE_KEY,
  loadSimpleUser,
  registerSimpleUser,
  simpleAuthIsDeviceOnly,
} from './simpleAuth'

describe('simpleAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_API_BASE', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('is device-only unless VITE_API_BASE is set', () => {
    expect(simpleAuthIsDeviceOnly()).toBe(true)
  })

  it('stores name and email in localStorage, not a server account', async () => {
    const user = await registerSimpleUser('Ada Lovelace', 'Ada@Email.com')
    expect(user.email).toBe('ada@email.com')
    expect(loadSimpleUser()?.name).toBe('Ada Lovelace')
    const raw = localStorage.getItem(SIMPLE_USER_STORAGE_KEY)
    expect(raw).toContain('ada@email.com')
    expect(raw).toContain('Ada Lovelace')
  })
})
