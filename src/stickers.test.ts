import { describe, expect, it } from 'vitest'
import { getFont, getFontSize } from './fonts'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import { defaultTextPosition, hitTestSticker, hitTestTextBlock } from './render'
import { clampStickerPos } from './stickers'

describe('sticker placement', () => {
  it('clamps sticker positions inside the canvas', () => {
    expect(clampStickerPos(-1)).toBe(0.06)
    expect(clampStickerPos(2)).toBe(0.94)
    expect(clampStickerPos(0.5)).toBe(0.5)
  })

  it('hits the nearest sticker under the cursor', () => {
    const platform = getPlatform('youtube')
    const stickers = [
      { id: 'new' as const, x: 0.2, y: 0.2 },
      { id: 'fire' as const, x: 0.8, y: 0.8 },
    ]
    expect(hitTestSticker(stickers, platform, platform.width * 0.2, platform.height * 0.2)).toBe(0)
    expect(hitTestSticker(stickers, platform, platform.width * 0.8, platform.height * 0.8)).toBe(1)
    expect(hitTestSticker(stickers, platform, platform.width * 0.5, platform.height * 0.5)).toBe(-1)
  })
})

describe('fonts', () => {
  it('resolves font and size presets', () => {
    expect(getFont('anton').label).toBe('Heavy')
    expect(getFontSize('XL').scale).toBeGreaterThan(1)
    expect(getFontSize('S').scale).toBeLessThan(1)
  })
})

describe('text placement', () => {
  it('detects clicks on the title block', () => {
    const platform = getPlatform('youtube')
    const niche = getNiche('tech')
    const textPos = defaultTextPosition(platform, 'photo-left')
    const input = {
      title: 'BIG TITLE HERE',
      tag: 'NEW',
      niche,
      platform,
      layout: 'photo-left' as const,
      photoShape: 'rounded' as const,
      accentOverride: '',
      watermark: true,
      photo: null,
      stickers: [],
      fontId: 'bebas' as const,
      fontSizeId: 'M' as const,
      textStyleId: 'classic' as const,
      textPos,
    }
    const box = textPos
    expect(
      hitTestTextBlock(input, box.x * platform.width + 20, box.y * platform.height + 40),
    ).toBe(true)
    expect(hitTestTextBlock(input, platform.width * 0.05, platform.height * 0.05)).toBe(false)
  })
})
