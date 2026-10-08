export type ScoreDimensionId =
  | 'attention'
  | 'mobile'
  | 'emotion'
  | 'text'
  | 'topic'

export type ScoreDimension = {
  id: ScoreDimensionId
  label: string
  score: number
  note: string
}

export type ThumbnailScore = {
  total: number
  dimensions: ScoreDimension[]
  recommendations: string[]
  /** Honest label — this is not a CTR prediction. */
  disclaimer: string
}

export type ScoreStats = {
  meanLuma: number
  lumaStd: number
  meanSat: number
  edge: number
  skin: number
  leftMass: number
  centerMass: number
  mobileContrast: number
  clutter: number
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function luma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function sat(r: number, g: number, b: number) {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  if (max === 0) return 0
  return (max - min) / max
}

function isSkin(r: number, g: number, b: number) {
  return r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15 && Math.abs(r - g) > 15
}

export function collectScoreStats(data: Uint8ClampedArray, width: number, height: number): ScoreStats {
  let sum = 0
  let sumSq = 0
  let satSum = 0
  let edgeSum = 0
  let skinN = 0
  let left = 0
  let center = 0
  let n = 0
  const leftCut = width * 0.38
  const centerA = width * 0.28
  const centerB = width * 0.72

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4
      const r = data[i]!
      const g = data[i + 1]!
      const b = data[i + 2]!
      const yv = luma(r, g, b)
      sum += yv
      sumSq += yv * yv
      satSum += sat(r, g, b)
      if (isSkin(r, g, b)) skinN += 1
      if (x < leftCut) left += yv
      if (x > centerA && x < centerB) center += yv
      if (x + 1 < width && y + 1 < height) {
        const j = (y * width + (x + 1)) * 4
        const k = ((y + 1) * width + x) * 4
        const dx = Math.abs(yv - luma(data[j]!, data[j + 1]!, data[j + 2]!))
        const dy = Math.abs(yv - luma(data[k]!, data[k + 1]!, data[k + 2]!))
        edgeSum += dx + dy
      }
      n += 1
    }
  }

  const meanLuma = n ? sum / n : 0
  const variance = n ? sumSq / n - meanLuma * meanLuma : 0
  const lumaStd = Math.sqrt(Math.max(0, variance))
  const meanSat = n ? satSum / n : 0
  const edge = n ? edgeSum / n : 0
  const skin = n ? skinN / n : 0
  const leftMass = n ? left / (sum || 1) : 0
  const centerMass = n ? center / (sum || 1) : 0

  const mw = Math.max(8, Math.floor(width / 4))
  const mh = Math.max(8, Math.floor(height / 4))
  let mobileContrast = 0
  let cells = 0
  for (let cy = 0; cy < mh; cy += 1) {
    for (let cx = 0; cx < mw; cx += 1) {
      let minL = 255
      let maxL = 0
      const x0 = Math.floor((cx * width) / mw)
      const x1 = Math.floor(((cx + 1) * width) / mw)
      const y0 = Math.floor((cy * height) / mh)
      const y1 = Math.floor(((cy + 1) * height) / mh)
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          const i = (y * width + x) * 4
          const yv = luma(data[i]!, data[i + 1]!, data[i + 2]!)
          if (yv < minL) minL = yv
          if (yv > maxL) maxL = yv
        }
      }
      mobileContrast += maxL - minL
      cells += 1
    }
  }
  mobileContrast = cells ? mobileContrast / cells : 0
  const clutter = Math.min(100, edge * 1.8)

  return {
    meanLuma,
    lumaStd,
    meanSat,
    edge,
    skin,
    leftMass,
    centerMass,
    mobileContrast,
    clutter,
  }
}

export function scoreFromStats(stats: ScoreStats): ThumbnailScore {
  const attention = clamp(
    stats.lumaStd * 1.15 + stats.meanSat * 55 + Math.min(22, stats.edge * 0.9) - Math.abs(stats.meanLuma - 118) * 0.12,
  )
  const mobile = clamp(stats.mobileContrast * 0.55 + stats.lumaStd * 0.55 - Math.max(0, stats.clutter - 42) * 0.35)
  const emotion = clamp(stats.skin * 280 + stats.meanSat * 40 + (stats.leftMass > 0.28 ? 8 : 0))
  const text = clamp(50 + stats.edge * 1.1 - Math.abs(stats.clutter - 28) * 0.9 + stats.lumaStd * 0.15)
  const topic = clamp(58 + (0.5 - Math.abs(stats.centerMass - 0.48)) * 70 - Math.max(0, stats.clutter - 48) * 0.6)

  const dimensions: ScoreDimension[] = [
    {
      id: 'attention',
      label: 'Attention',
      score: attention,
      note: attention >= 70 ? 'Strong contrast and color pop.' : 'Boost contrast and make one subject larger.',
    },
    {
      id: 'mobile',
      label: 'Mobile readability',
      score: mobile,
      note: mobile >= 70 ? 'Still reads when shrunk to a phone tile.' : 'Too much detail is lost at phone size — crop tighter.',
    },
    {
      id: 'emotion',
      label: 'Emotional impact',
      score: emotion,
      note: emotion >= 65 ? 'Face or color energy is doing work.' : 'A bigger face or clearer reaction usually wins the click.',
    },
    {
      id: 'text',
      label: 'Text clarity',
      score: text,
      note: text >= 70 ? 'Edges look thumbnail-sharp.' : 'Fewer words, thicker outline, more contrast vs the background.',
    },
    {
      id: 'topic',
      label: 'Topic relevance',
      score: topic,
      note: 'Visual focus heuristic — not a check against your actual video topic.',
    },
  ]

  const total = clamp(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length)
  const recommendations: string[] = []
  if (attention < 70) recommendations.push('Crop closer so one subject fills the frame, then raise contrast.')
  if (mobile < 70) recommendations.push('Check the thumbnail at ~160px wide. If the idea disappears, simplify.')
  if (emotion < 65) recommendations.push('Add a face, eyes, or a stronger expression on the left third.')
  if (text < 68) recommendations.push('Use 3–5 punchy words max, thick outline, and keep them out of busy areas.')
  if (topic < 68) recommendations.push('Make one idea obvious — a collage or busy background hides the topic.')
  if (recommendations.length === 0) {
    recommendations.push('Solid base. Generate 3 alternatives with a tighter crop and a bolder title overlay.')
  }

  return {
    total,
    dimensions,
    recommendations,
    disclaimer:
      'Thumbric Score is a visual heuristic (contrast, faces, clutter, phone-size readability). It is not a CTR prediction and does not use your YouTube analytics.',
  }
}

export function analyzeThumbnailImageData(data: Uint8ClampedArray, width: number, height: number) {
  return scoreFromStats(collectScoreStats(data, width, height))
}

export function extractImageData(image: HTMLImageElement, width = 320, height = 180) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('This browser cannot analyze images.')
  ctx.drawImage(image, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}

export function analyzeThumbnailImage(image: HTMLImageElement) {
  const pixels = extractImageData(image)
  return analyzeThumbnailImageData(pixels.data, pixels.width, pixels.height)
}

export function hintFromScore(score: ThumbnailScore, title = '') {
  const weak = score.dimensions.filter((item) => item.score < 70).map((item) => item.id)
  const bits = ['cinematic YouTube thumbnail still, oversized subject, high contrast, empty space for a title']
  if (weak.includes('emotion')) bits.push('expressive close-up face looking at camera')
  if (weak.includes('attention')) bits.push('dramatic rim light, saturated color, one hero subject')
  if (weak.includes('mobile')) bits.push('simple silhouette, readable at phone-tile size')
  if (title.trim()) bits.push(`mood matching: ${title.trim().slice(0, 80)}`)
  return bits.join(', ')
}
