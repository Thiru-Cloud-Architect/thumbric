import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  apiLookBudget,
  getProviderReadiness,
  probeWorkerAiReady,
  resolveAiBackend,
  resolveProviderReadiness,
} from './aiConfig'

describe('resolveAiBackend', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults to free Pollinations when no keys are set', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', '')
    const backend = resolveAiBackend()
    expect(backend.kind).toBe('pollinations')
    expect(backend.premium).toBe(false)
    expect(apiLookBudget(backend.kind)).toBe(1)
  })

  it('prefers Worker when VITE_API_BASE is set', () => {
    vi.stubEnv('VITE_API_BASE', 'https://thumbric-api.example.workers.dev/')
    vi.stubEnv('VITE_FAL_KEY', 'should-not-win')
    const backend = resolveAiBackend()
    expect(backend.kind).toBe('worker')
    expect(backend.premium).toBe(true)
    expect(apiLookBudget(backend.kind)).toBe(3)
  })

  it('falls back to fal-client for local demo keys', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', 'fal_demo')
    const backend = resolveAiBackend()
    expect(backend.kind).toBe('fal-client')
    expect(backend.premium).toBe(true)
  })
})

describe('getProviderReadiness', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('reports Free preview engine when unconfigured', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', '')
    const readiness = getProviderReadiness()
    expect(readiness.tier).toBe('free')
    expect(readiness.statusLabel).toBe('Free preview engine')
    expect(readiness.configured).toBe(false)
  })

  it('reports Pro imaging ready when fal-client key is present', () => {
    vi.stubEnv('VITE_API_BASE', '')
    vi.stubEnv('VITE_FAL_KEY', 'fal_demo')
    const readiness = getProviderReadiness()
    expect(readiness.tier).toBe('pro')
    expect(readiness.statusLabel).toBe('Pro imaging ready')
    expect(readiness.configured).toBe(true)
  })

  it('downgrades Worker hint when probe says key missing', () => {
    vi.stubEnv('VITE_API_BASE', 'https://thumbric-api.example.workers.dev')
    vi.stubEnv('VITE_FAL_KEY', '')
    const readiness = getProviderReadiness(false)
    expect(readiness.tier).toBe('pro')
    expect(readiness.configured).toBe(true)
    expect(readiness.statusHint).toMatch(/FAL_KEY is missing/i)
  })
})

describe('probeWorkerAiReady', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns null when no API base is configured', async () => {
    vi.stubEnv('VITE_API_BASE', '')
    await expect(probeWorkerAiReady()).resolves.toBeNull()
  })

  it('reads ready from /api/ai/ready', async () => {
    vi.stubEnv('VITE_API_BASE', 'https://thumbric-api.example.workers.dev')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ ready: true, backend: 'fal' }),
      })),
    )
    await expect(probeWorkerAiReady()).resolves.toBe(true)
    const readiness = await resolveProviderReadiness()
    expect(readiness.statusLabel).toMatch(/Pro imaging/i)
    expect(readiness.workerReady).toBe(true)
  })
})
