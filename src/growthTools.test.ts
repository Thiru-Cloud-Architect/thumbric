import { describe, expect, it } from 'vitest'
import { collageScoreFromImageData, looksLikeCollageFromImageData, LOCAL_LOOK_RECIPES } from './aiLooks'
import { calculateCtr, parseCount } from './ctrCalc'
import { analyzeThumbnailImageData } from './score'
import { decodeRoastPayload, encodeRoastPayload } from './sharePayload'
import { SITE_ROUTES } from './siteRoutes'
import { analyzeTitle } from './titleAnalyze'
import { TOOL_NAV } from './toolsCatalog'

function fill(width: number, height: number, fn: (x: number, y: number) => [number, number, number]) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const [r, g, b] = fn(x, y)
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
      data[i + 3] = 255
    }
  }
  return data
}

describe('thumbnail score heuristic', () => {
  it('scores a high-contrast left-weighted still higher than a flat gray field', () => {
    const punchy = fill(64, 36, (x) => {
      if (x < 24) return [240, 80, 40]
      return [12, 10, 18]
    })
    const flat = fill(64, 36, () => [120, 120, 120])
    const high = analyzeThumbnailImageData(punchy, 64, 36)
    const low = analyzeThumbnailImageData(flat, 64, 36)
    expect(high.total).toBeGreaterThan(low.total)
    expect(high.disclaimer).toMatch(/not a CTR/i)
    expect(high.dimensions.map((item) => item.id)).toEqual([
      'attention',
      'mobile',
      'emotion',
      'text',
      'topic',
    ])
  })
})

describe('title analyzer', () => {
  it('flags empty titles and scores a numbered hook', () => {
    expect(analyzeTitle('').score).toBe(0)
    const good = analyzeTitle('I Spent $1 And This Happened')
    expect(good.length).toBeGreaterThan(10)
    expect(good.issues.some((item) => item.id === 'number')).toBe(true)
    expect(good.score).toBeGreaterThan(50)
  })
})

describe('CTR calculator', () => {
  it('computes percent and picks a band without promising the future', () => {
    expect(parseCount('10,000')).toBe(10000)
    const result = calculateCtr(10000, 420)
    expect(result.ctr).toBeCloseTo(4.2, 5)
    expect(result.band.id).toBe('strong')
    expect(result.disclaimer).toMatch(/not a prediction/i)
  })
})

describe('shareable roast payload', () => {
  it('round-trips a score without images', () => {
    const score = analyzeThumbnailImageData(
      fill(32, 18, (x) => (x < 10 ? [200, 40, 40] : [20, 20, 30])),
      32,
      18,
    )
    const code = encodeRoastPayload(score, 'Test title')
    const back = decodeRoastPayload(code)
    expect(back?.score).toBe(score.total)
    expect(back?.title).toBe('Test title')
    expect(decodeRoastPayload('%%%')).toBeNull()
  })
})

describe('collage seam detector', () => {
  it('treats a hard vertical split as collage-like', () => {
    const split = fill(96, 54, (x) => (x < 48 ? [10, 10, 10] : [250, 250, 250]))
    const photo = fill(96, 54, (x, y) => {
      const v = 80 + ((x + y) % 40)
      return [v, v + 8, v + 16]
    })
    expect(looksLikeCollageFromImageData(split, 96, 54)).toBe(true)
    expect(collageScoreFromImageData(split, 96, 54)).toBeGreaterThan(
      collageScoreFromImageData(photo, 96, 54),
    )
  })
})

describe('look recipes', () => {
  it('keeps Punch / Warm / Cinematic as near-full crops, not default quadrants', () => {
    expect(LOCAL_LOOK_RECIPES.map((item) => item.label)).toEqual(['Punch', 'Warm', 'Cinematic'])
    expect(LOCAL_LOOK_RECIPES[0]!.crop.sw).toBeGreaterThan(0.8)
    expect(LOCAL_LOOK_RECIPES[1]!.grade.sepia).toBeGreaterThan(0)
  })
})

describe('tool catalog / SEO routes', () => {
  it('exposes menu tools and unique landing paths', () => {
    expect(TOOL_NAV.map((item) => item.path)).toContain('/youtube-thumbnail-score')
    expect(SITE_ROUTES.some((item) => item.path === '/ai-thumbnail-maker')).toBe(true)
    const titles = SITE_ROUTES.map((item) => item.title)
    expect(new Set(titles).size).toBe(titles.length)
  })
})
