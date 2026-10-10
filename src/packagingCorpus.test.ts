import { describe, expect, it } from 'vitest'
import {
  buildCreativeBrief,
  fullHeadline,
  naturalTitle,
  parseTopic,
  sceneTopicTokens,
} from './creativeBrief'
import {
  PACKAGING_BANLIST,
  PACKAGING_CORPUS,
  type PackagingCorpusCase,
} from './packagingCorpus'
import { sceneBriefFromInput } from './youtubeUrl'

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function containsAny(haystack: string, needles: string[]) {
  const h = normalize(haystack)
  return needles.some((n) => h.includes(normalize(n)))
}

function assertCase(entry: PackagingCorpusCase) {
  const inputs = [entry.topic, entry.poisoned].filter(Boolean) as string[]

  for (const input of inputs) {
    const parsed = parseTopic(input)
    const brief = buildCreativeBrief(input)
    const titles = brief.concepts.map((c) => fullHeadline(c)).join(' | ')
    const visuals = brief.concepts.map((c) => c.visual).join(' | ')
    const combined = `${parsed.raw} ${titles} ${visuals}`

    for (const ban of PACKAGING_BANLIST) {
      expect(combined, `${entry.id} banned ${ban}`).not.toMatch(ban)
    }

    expect(naturalTitle(input), `${entry.id} naturalTitle`).not.toMatch(/TITLED/i)
    expect(brief.concepts).toHaveLength(3)
    expect(new Set(brief.concepts.map((c) => c.id)).size).toBe(3)

    // Content tokens survive in topic parse or headlines.
    const keepHaystack = `${parsed.raw} ${parsed.detail} ${parsed.hookPhrase} ${titles}`
    for (const token of entry.mustKeep) {
      expect(containsAny(keepHaystack, [token]), `${entry.id} mustKeep "${token}" in ${keepHaystack}`).toBe(
        true,
      )
    }

    // Banlist checks titles/visuals — not the raw user topic (which may repeat noise words).
    const outputOnly = `${titles} ${visuals}`
    for (const token of entry.mustNever ?? []) {
      expect(containsAny(outputOnly, [token]), `${entry.id} mustNever "${token}"`).toBe(false)
    }

    if (entry.expectKind) {
      expect(brief.kind, `${entry.id} kind`).toBe(entry.expectKind)
    }

    if (entry.visualAnchors?.length) {
      expect(
        containsAny(visuals, entry.visualAnchors),
        `${entry.id} visual anchors ${entry.visualAnchors.join('|')} missing in visuals`,
      ).toBe(true)
    }

    // Headline must share at least one content token with the topic (not pure filler).
    const topicTokens = sceneTopicTokens(entry.topic)
    for (const concept of brief.concepts) {
      const headlineTokens = sceneTopicTokens(fullHeadline(concept))
      const overlap = headlineTokens.filter((t) => topicTokens.includes(t))
      const fillerOnly = /^(DEALER SCAM|AVOID THIS|GOT MONEY BACK|THE REAL ENDING|NOT WHAT|BEFORE \/ AFTER|THEY MADE IT|NEW DROP|FROM SILENCE|FROM ZERO|WAIT…|WHO WINS)\b/i.test(
        concept.headline,
      )
      if (!fillerOnly) {
        expect(
          overlap.length > 0 || containsAny(fullHeadline(concept), entry.mustKeep),
          `${entry.id}/${concept.id} headline "${fullHeadline(concept)}" shares topic tokens`,
        ).toBe(true)
      } else {
        // Filler headlines must still carry topic in subheadline or visual.
        expect(
          containsAny(`${concept.subheadline || ''} ${concept.visual}`, entry.mustKeep) ||
            containsAny(concept.visual, entry.visualAnchors || entry.mustKeep),
          `${entry.id}/${concept.id} filler headline still grounded`,
        ).toBe(true)
      }
    }
  }

  // oEmbed path must stay clean.
  const oembedBrief = sceneBriefFromInput('https://youtu.be/dQw4w9WgXcQ', {
    videoId: 'dQw4w9WgXcQ',
    canonicalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: entry.topic,
    authorName: 'Sample Channel',
    fetched: true,
    framesAvailable: false,
  })
  expect(oembedBrief).toBe(entry.topic.trim())
  expect(oembedBrief).not.toMatch(/High-CTR|titled/i)
}

describe('packaging corpus (failure classes)', () => {
  it('covers every declared failure class', () => {
    const classes = new Set(PACKAGING_CORPUS.map((c) => c.class))
    expect(classes.size).toBeGreaterThanOrEqual(10)
    expect(PACKAGING_CORPUS.length).toBeGreaterThanOrEqual(20)
  })

  for (const entry of PACKAGING_CORPUS) {
    it(`${entry.class}:${entry.id}`, () => {
      assertCase(entry)
    })
  }
})
