import { describe, expect, it } from 'vitest'
import { LAYOUTS, PHOTO_SHAPES } from './layout'
import { NICHES, NICHE_GROUPS, filterNiches, getNiche, HEIGHT, WIDTH } from './niches'
import { PLATFORMS, getPlatform } from './platforms'
import { STICKERS } from './stickers'

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

describe('platforms and layout', () => {
  it('supports major social sizes and orientations', () => {
    expect(PLATFORMS.length).toBeGreaterThanOrEqual(6)
    expect(getPlatform('shorts').orientation).toBe('vertical')
    expect(getPlatform('instagram-post').orientation).toBe('square')
    expect(getPlatform('youtube').width).toBe(1280)
  })

  it('offers move and photo shape options', () => {
    expect(LAYOUTS.map((item) => item.id)).toContain('photo-top')
    expect(PHOTO_SHAPES.map((item) => item.id)).toContain('circle')
  })
})

describe('stickers', () => {
  it('offers many simple click-boost stickers', () => {
    expect(STICKERS.length).toBeGreaterThanOrEqual(16)
    expect(STICKERS.some((sticker) => sticker.id === 'arrow')).toBe(true)
    expect(STICKERS.some((sticker) => sticker.id === 'live')).toBe(true)
    expect(STICKERS.some((sticker) => sticker.id === 'day1')).toBe(true)
  })
})
