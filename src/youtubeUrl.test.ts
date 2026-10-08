import { describe, expect, it } from 'vitest'
import {
  extractYoutubeId,
  looksLikeYoutubeUrl,
  parseYoutubeInput,
  sceneBriefFromInput,
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

  it('builds a scene brief from title meta', () => {
    const brief = sceneBriefFromInput('https://youtu.be/dQw4w9WgXcQ', {
      videoId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Never Gonna Give You Up',
      authorName: 'Rick Astley',
      fetched: true,
      framesAvailable: false,
    })
    expect(brief).toMatch(/Never Gonna Give You Up/)
    expect(brief).toMatch(/Rick Astley/)
    expect(brief).toMatch(/High-CTR packaging/)
  })

  it('parses canonical watch URLs', () => {
    expect(parseYoutubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      videoId: 'dQw4w9WgXcQ',
      canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    })
  })
})
