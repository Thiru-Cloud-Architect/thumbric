import { describe, expect, it } from 'vitest'
import { LAYOUTS, PHOTO_SHAPES } from './layout'
import { NICHES, getNiche } from './niches'
import { getPlatform } from './platforms'
import { TEXT_STYLES } from './textStyle'
import { pickQuickIdea } from './quickIdeas'
import { FONTS } from './fonts'

describe('pickQuickIdea', () => {
  it('returns only valid niche, layout, font, and title style ids', () => {
    const youtube = getPlatform('youtube')
    const shorts = getPlatform('shorts')
    for (let i = 0; i < 30; i++) {
      for (const platform of [youtube, shorts]) {
        const idea = pickQuickIdea(platform)
        expect(NICHES.some((item) => item.id === idea.nicheId)).toBe(true)
        expect(LAYOUTS.some((item) => item.id === idea.layout)).toBe(true)
        expect(FONTS.some((item) => item.id === idea.fontId)).toBe(true)
        expect(TEXT_STYLES.some((item) => item.id === idea.textStyleId)).toBe(true)
        expect(PHOTO_SHAPES.some((item) => item.id === idea.photoShape)).toBe(true)
        if (platform.orientation === 'vertical') {
          expect(['photo-top', 'photo-full']).toContain(idea.layout)
        } else {
          expect(idea.layout).not.toBe('photo-top')
        }
      }
    }
  })

  it('uses display fonts for punchy thumbnails', () => {
    const display = new Set(FONTS.filter((f) => f.category === 'display').map((f) => f.id))
    for (let i = 0; i < 15; i++) {
      expect(display.has(pickQuickIdea(getPlatform('youtube')).fontId)).toBe(true)
    }
  })

  it('pairs with getNiche for labels', () => {
    const idea = pickQuickIdea(getPlatform('youtube'))
    expect(getNiche(idea.nicheId).label.length).toBeGreaterThan(0)
  })
})
