/** YouTube URL helpers — id parse + optional oEmbed title. No frame fetch. */

const ID_RE = /^[\w-]{11}$/

export type YoutubeParse = {
  videoId: string
  canonicalUrl: string
}

export type YoutubeMeta = YoutubeParse & {
  title: string | null
  authorName: string | null
  fetched: boolean
  /** Honest: we never pull video frames on the free path. */
  framesAvailable: false
}

export function extractYoutubeId(raw: string): string | null {
  const text = raw.trim()
  if (!text) return null
  if (ID_RE.test(text)) return text

  try {
    const url = new URL(text.includes('://') ? text : `https://${text}`)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? ''
      return ID_RE.test(id) ? id : null
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const v = url.searchParams.get('v')
      if (v && ID_RE.test(v)) return v

      const parts = url.pathname.split('/').filter(Boolean)
      const kind = parts[0]
      if (
        (kind === 'embed' || kind === 'shorts' || kind === 'live' || kind === 'v') &&
        parts[1] &&
        ID_RE.test(parts[1])
      ) {
        return parts[1]
      }
    }
  } catch {
    return null
  }

  return null
}

/** True when the whole input (or a clear URL substring) looks like a YouTube link. */
export function looksLikeYoutubeUrl(raw: string): boolean {
  const text = raw.trim()
  if (!text) return false
  if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\b/i.test(text)) return true
  if (/^(www\.)?(youtube\.com|youtu\.be)\//i.test(text)) return true
  return extractYoutubeId(text) != null && /\byoutube\b|\byoutu\.be\b/i.test(text)
}

export function parseYoutubeInput(raw: string): YoutubeParse | null {
  const videoId = extractYoutubeId(raw)
  if (!videoId) return null
  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

/**
 * Prefer oEmbed title when the network allows it. Falls back to id-only brief.
 * Never claims frame analysis — free path has no paid video AI.
 */
export async function resolveYoutubeMeta(
  raw: string,
  signal?: AbortSignal,
): Promise<YoutubeMeta | null> {
  const parsed = parseYoutubeInput(raw)
  if (!parsed) return null

  const base: YoutubeMeta = {
    ...parsed,
    title: null,
    authorName: null,
    fetched: false,
    framesAvailable: false,
  }

  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.canonicalUrl)}&format=json`
    const response = await fetch(oembed, { signal })
    if (!response.ok) return base
    const data = (await response.json()) as { title?: string; author_name?: string }
    return {
      ...base,
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : null,
      authorName:
        typeof data.author_name === 'string' && data.author_name.trim()
          ? data.author_name.trim()
          : null,
      fetched: true,
    }
  } catch {
    return base
  }
}

/** Turn describe-or-URL input into a scene brief for free image AI. */
export function sceneBriefFromInput(raw: string, meta: YoutubeMeta | null): string {
  const trimmed = raw.trim()
  if (meta) {
    if (meta.title) {
      return `YouTube video titled “${meta.title}”${
        meta.authorName ? ` by ${meta.authorName}` : ''
      }. High-CTR packaging still: one clear subject, dramatic light, empty space for a bold title. Do not invent burned-in text.`
    }
    return `YouTube video ${meta.videoId}. High-CTR packaging still from the topic implied by a typical clickable cover — one clear subject, empty third for a title. Frames were not available; invent a strong cover concept, not a collage.`
  }
  return trimmed
}

export const YOUTUBE_FRAME_HONESTY =
  'We can read the video title from a YouTube link, but we cannot pull frames yet (privacy / no paid video AI). Describe the scene if the title is not enough.'
