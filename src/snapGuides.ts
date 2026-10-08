export type NormalizedPoint = { x: number; y: number }

export type SnapResult = {
  point: NormalizedPoint
  guides: { vertical?: number; horizontal?: number }
}

const SNAP_LINES = [0.05, 0.333, 0.5, 0.667, 0.95]
const THRESHOLD = 0.014

/** Snap title/sticker anchors to common composition lines (center, thirds, safe inset). */
export function snapNormalized(point: NormalizedPoint): SnapResult {
  let { x, y } = point
  const guides: SnapResult['guides'] = {}

  for (const line of SNAP_LINES) {
    if (Math.abs(x - line) <= THRESHOLD) {
      x = line
      guides.vertical = line
      break
    }
  }
  for (const line of SNAP_LINES) {
    if (Math.abs(y - line) <= THRESHOLD) {
      y = line
      guides.horizontal = line
      break
    }
  }

  return { point: { x, y }, guides }
}
