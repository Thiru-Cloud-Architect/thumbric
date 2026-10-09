import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(rel: string) {
  return fs.readFileSync(path.join(root, rel), 'utf8')
}

function ruleBlock(css: string, selector: string): string | null {
  const idx = css.indexOf(selector)
  if (idx < 0) return null
  const open = css.indexOf('{', idx)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}') {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  return null
}

describe('More title options layout (regression)', () => {
  it('anchors the panel absolutely so opening it does not grow page layout', () => {
    const css = read('src/App.css')
    const wrap = ruleBlock(css, '.inspector-title-more {')
    const panel = ruleBlock(css, '.inspector-title-more-panel {')
    expect(wrap, 'missing .inspector-title-more').toBeTruthy()
    expect(panel, 'missing .inspector-title-more-panel').toBeTruthy()
    expect(wrap!).toMatch(/position:\s*relative/)
    expect(panel!).toMatch(/position:\s*absolute/)
    expect(panel!).toMatch(/bottom:\s*calc\(/)
  })

  it('uses a toggle + popover region instead of expanding inline details for title extras', () => {
    const src = read('src/HomePage.tsx')
    expect(src).toContain('id="title-options-popover"')
    expect(src).toContain('inspector-title-more-panel')
    expect(src).toContain('aria-controls="title-options-popover"')
    expect(src).toContain('More title options')
    expect(src).toMatch(/showTitleOptions/)
    // Title extras live in the absolute panel, not a details disclosure keyed to that label.
    expect(src).not.toMatch(/<details[^>]*>[\s\S]{0,400}More title options/)
  })
})
