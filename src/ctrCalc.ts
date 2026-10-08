export type CtrBand = {
  id: 'low' | 'typical' | 'strong' | 'excellent'
  label: string
  min: number
  hint: string
}

export const CTR_BANDS: CtrBand[] = [
  { id: 'low', label: 'Low', min: 0, hint: 'Many videos sit here. A clearer thumbnail + title pair is the first lever.' },
  { id: 'typical', label: 'Typical', min: 2, hint: 'Around a common public range for a lot of niches — still room to climb.' },
  { id: 'strong', label: 'Strong', min: 4, hint: 'Viewers are choosing this video more often than average browse noise.' },
  { id: 'excellent', label: 'Excellent', min: 8, hint: 'Rare. Protect the format — do not clutter the next thumbnail.' },
]

export type CtrResult = {
  impressions: number
  clicks: number
  ctr: number
  band: CtrBand
  disclaimer: string
}

export function parseCount(raw: string) {
  const n = Number(String(raw).replace(/,/g, '').trim())
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function calculateCtr(impressions: number, clicks: number): CtrResult {
  const imps = Math.max(0, impressions)
  const clk = Math.max(0, clicks)
  const ctr = imps > 0 ? (clk / imps) * 100 : 0
  const band = [...CTR_BANDS].reverse().find((item) => ctr >= item.min) ?? CTR_BANDS[0]!
  return {
    impressions: imps,
    clicks: clk,
    ctr,
    band,
    disclaimer:
      'CTR = clicks ÷ impressions × 100. Bands are rough public ranges, not your niche benchmark and not a prediction.',
  }
}

export function formatCtr(ctr: number) {
  return `${ctr.toFixed(2)}%`
}
