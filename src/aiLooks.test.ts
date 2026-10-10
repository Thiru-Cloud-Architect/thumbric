import { describe, expect, it, vi } from 'vitest'
import { fillLooksToTarget } from './aiLooks'
import type { AiGeneratedImage } from './aiThumbnail'

function stubImage(label: string): AiGeneratedImage {
  const image = {
    width: 64,
    height: 36,
    // minimal stand-in — stylize path is mocked below when needed
  } as unknown as HTMLImageElement
  return {
    image,
    objectUrl: `blob:${label}`,
    prompt: 'test',
    seed: 1,
    styleId: 'auto',
    lookLabel: label,
    source: 'premium',
  }
}

describe('fillLooksToTarget', () => {
  it('keeps three premium fal stills as premium without restyling them away', async () => {
    const results = [stubImage('A'), stubImage('B'), stubImage('C')]
    const filled = await fillLooksToTarget(results, 3, {
      width: 64,
      height: 36,
      prompt: 'test',
      seed: 1,
      styleId: 'auto',
    })
    expect(filled).toHaveLength(3)
    expect(filled.every((item) => item.source === 'premium')).toBe(true)
    expect(filled.map((item) => item.objectUrl)).toEqual([
      'blob:A',
      'blob:B',
      'blob:C',
    ])
  })

  it('inherits premium when filling extra local grades from one fal still', async () => {
    // Force the fill branch (1 result) with a mocked stylize by stubbing canvas via spy on createElement.
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const canvas = createElement('canvas') as HTMLCanvasElement
        const ctx = {
          filter: '',
          drawImage: vi.fn(),
          fillStyle: '',
          fillRect: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          rect: vi.fn(),
          clip: vi.fn(),
          createRadialGradient: () => ({ addColorStop: vi.fn() }),
          globalCompositeOperation: '',
        }
        vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
        vi.spyOn(canvas, 'toBlob').mockImplementation((cb) => {
          cb?.(new Blob(['x'], { type: 'image/png' }))
        })
        return canvas
      }
      return createElement(tag)
    })

    // loadImage inside stylize uses Image — provide a tiny decode stub
    class FakeImage {
      width = 64
      height = 36
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      set src(_v: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage as unknown as typeof Image)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: () => 'blob:grade',
      revokeObjectURL: vi.fn(),
    })

    const filled = await fillLooksToTarget([stubImage('Hero')], 3, {
      width: 64,
      height: 36,
      prompt: 'test',
      seed: 1,
      styleId: 'auto',
    })

    expect(filled.length).toBeGreaterThan(0)
    expect(filled.every((item) => item.source === 'premium')).toBe(true)

    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
})
