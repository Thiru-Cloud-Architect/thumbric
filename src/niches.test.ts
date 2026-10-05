import { describe, expect, it } from 'vitest'
import { NICHES, getNiche, HEIGHT, WIDTH } from './niches'

describe('ThumbForge niches', () => {
  it('covers five creator niches at YouTube size', () => {
    expect(NICHES).toHaveLength(5)
    expect(WIDTH).toBe(1280)
    expect(HEIGHT).toBe(720)
    expect(getNiche('finance').label).toBe('Finance')
    expect(getNiche('unknown' as never).id).toBe('tech')
  })

  it('gives every niche a distinct accent and shape', () => {
    const accents = new Set(NICHES.map((niche) => niche.accent))
    const shapes = new Set(NICHES.map((niche) => niche.shape))
    expect(accents.size).toBe(5)
    expect(shapes.size).toBe(5)
  })
})
