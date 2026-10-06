import { describe, expect, it } from 'vitest'
import { DEFAULT_TITLE_FONT_SIZE, getFont } from './fonts'
import { getNiche } from './niches'
import { getPlatform } from './platforms'
import {
  clampTextPosition,
  defaultTextPosition,
  hitTestSticker,
  hitTestTextBlock,
} from './render'
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
  it('resolves font presets', () => {
    expect(getFont('anton').label).toBe('Anton')
    expect(DEFAULT_TITLE_FONT_SIZE).toBeGreaterThan(80)
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
      titleFontSizePx: DEFAULT_TITLE_FONT_SIZE,
      textStyleId: 'classic' as const,
      textPos,
    }
    expect(
      hitTestTextBlock(input, textPos.x * platform.width + 20, textPos.y * platform.height + 40),
    ).toBe(true)
    expect(hitTestTextBlock(input, platform.width * 0.05, platform.height * 0.05)).toBe(false)
  })

  it('allows photo-full titles in the upper third of the canvas', () => {
    const platform = getPlatform('youtube')
    const upper = clampTextPosition(platform, 'photo-full', { x: 0.08, y: 0.08 })
    expect(upper.y).toBeLessThan(0.2)
    expect(upper.y).toBeGreaterThan(0)

    const clampedTop = clampTextPosition(platform, 'photo-full', { x: 0.08, y: -1 })
    expect(clampedTop.y).toBeGreaterThan(0)
    expect(clampedTop.y).toBeLessThan(0.1)

    const clampedBottom = clampTextPosition(platform, 'photo-full', { x: 0.08, y: 2 })
    expect(clampedBottom.y).toBeLessThan(1)
    expect(clampedBottom.y).toBeGreaterThan(0.5)
  })

  it('allows shorts photo-full titles near the top', () => {
    const platform = getPlatform('shorts')
    const upper = clampTextPosition(platform, 'photo-full', { x: 0.1, y: 0.05 })
    expect(upper.y).toBeLessThan(0.15)
  })
})
