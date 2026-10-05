import { describe, expect, it } from 'vitest'
import { NICHES, NICHE_GROUPS, filterNiches, getNiche, HEIGHT, WIDTH } from './niches'

describe('ThumbForge niches', () => {
  it('covers many creator channel types at YouTube size', () => {
    expect(NICHES.length).toBeGreaterThanOrEqual(16)
    expect(WIDTH).toBe(1280)
    expect(HEIGHT).toBe(720)
    expect(getNiche('finance').label).toBe('Finance')
    expect(getNiche('travel').group).toBe('Lifestyle')
    expect(getNiche('unknown' as never).id).toBe('tech')
  })

  it('gives every niche a distinct accent and shape', () => {
    const accents = new Set(NICHES.map((niche) => niche.accent))
    const shapes = new Set(NICHES.map((niche) => niche.shape))
    expect(accents.size).toBe(NICHES.length)
    expect(shapes.size).toBe(NICHES.length)
  })

  it('filters channel types by search text', () => {
    expect(filterNiches('travel').map((niche) => niche.id)).toEqual(['travel'])
    expect(filterNiches('money').every((niche) => niche.group === 'Money')).toBe(true)
    expect(filterNiches('zzzz').length).toBe(0)
    expect(NICHE_GROUPS).toContain('Lifestyle')
  })
})
