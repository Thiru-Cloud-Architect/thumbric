import type { ThumbnailScore } from './score'

export type RoastPayload = {
  v: 1
  score: number
  dims: { id: string; label: string; score: number }[]
  tips: string[]
  title?: string
}

export function encodeRoastPayload(score: ThumbnailScore, title = '') {
  const payload: RoastPayload = {
    v: 1,
    score: score.total,
    dims: score.dimensions.map((item) => ({ id: item.id, label: item.label, score: item.score })),
    tips: score.recommendations.slice(0, 4),
    title: title.trim().slice(0, 80) || undefined,
  }
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function decodeRoastPayload(code: string): RoastPayload | null {
  try {
    const padded = code.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    const binary = atob(padded + pad)
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0))
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as RoastPayload
    if (parsed?.v !== 1 || typeof parsed.score !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function shareTargets(url: string, text: string) {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text)
  return [
    { id: 'copy', label: 'Copy link', href: url },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { id: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ] as const
}
