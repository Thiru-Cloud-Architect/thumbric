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
    expect(user.cloudSynced).toBe(false)
    expect(user.cloudNote).toMatch(/device/i)
    expect(loadSimpleUser()?.name).toBe('Ada Lovelace')
    const raw = localStorage.getItem(SIMPLE_USER_STORAGE_KEY)
    expect(raw).toContain('ada@email.com')
    expect(raw).toContain('Ada Lovelace')
  })

  it('keeps local signup when Worker register returns 501', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://thumbric-api.example.workers.dev')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 501,
      json: async () => ({ error: 'KV is not bound' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = await registerSimpleUser('Thiru', 'kumarofrcet@gmail.com')
    expect(user.email).toBe('kumarofrcet@gmail.com')
    expect(user.cloudSynced).toBe(false)
    expect(user.cloudNote).toMatch(/device/i)
    expect(loadSimpleUser()?.email).toBe('kumarofrcet@gmail.com')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://thumbric-api.example.workers.dev/api/register',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('marks cloudSynced when Worker stores the user', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://thumbric-api.example.workers.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, stored: true }),
      }),
    )

    const user = await registerSimpleUser('Thiru', 'ok@example.com')
    expect(user.cloudSynced).toBe(true)
    expect(user.cloudNote).toBeUndefined()
  })
})
