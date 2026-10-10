import { describe, expect, it } from 'vitest'
import {
  extractYoutubeId,
  looksLikeYoutubeUrl,
  parseYoutubeInput,
  sceneBriefFromInput,
  topicFromYoutubeMeta,
} from './youtubeUrl'

describe('youtubeUrl', () => {
  it('extracts ids from common URL shapes', () => {
    expect(extractYoutubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(extractYoutubeId('youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('detects URL vs plain description', () => {
    expect(looksLikeYoutubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
    expect(looksLikeYoutubeUrl('shocked creator in neon studio')).toBe(false)
  })

  it('builds a clean topic from title meta (no packaging boilerplate)', () => {
    const meta = {
      videoId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Why did i not book slavia? (My sad skoda story)',
      authorName: 'tech panda tamil',
      fetched: true as const,
      framesAvailable: false as const,
    }
    const brief = sceneBriefFromInput('https://youtu.be/dQw4w9WgXcQ', meta)
    expect(brief).toBe('Why did i not book slavia? (My sad skoda story)')
    expect(brief).not.toMatch(/High-CTR packaging/i)
    expect(brief).not.toMatch(/titled/i)
    expect(topicFromYoutubeMeta(meta)).toBe(brief)
  })

  it('parses canonical watch URLs', () => {
    expect(parseYoutubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      videoId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
  })
})
