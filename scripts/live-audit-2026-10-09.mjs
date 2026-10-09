#!/usr/bin/env node
/**
 * Live site audit for 2026-10-09.
 * Screenshots + DOM probes + console capture for production and local.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, '.walkthrough', 'live-audit-2026-10-09')
fs.mkdirSync(outDir, { recursive: true })

const LOCAL = process.env.AUDIT_LOCAL || 'http://127.0.0.1:43201'
const PROD = process.env.AUDIT_PROD || 'https://thumbric.app'
const MODE = process.env.AUDIT_MODE || 'all' // prod | local | all | e2e

const results = {
  startedAt: new Date().toISOString(),
  local: LOCAL,
  prod: PROD,
  pages: [],
  e2e: null,
  routes: [],
}

async function fetchRoute(base, route) {
  const url = `${base.replace(/\/$/, '')}${route}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    const hasApp = /id=["']root["']|Thumbric|\/assets\/index-/.test(text)
    return {
      base,
      route,
      status: res.status,
      ok: res.ok && hasApp,
      bytes: text.length,
      asset: (text.match(/assets\/index-[^"']+\.js/) || [])[0] || null,
    }
  } catch (error) {
    return { base, route, status: 0, ok: false, error: String(error), bytes: 0 }
  }
}

async function shotPage(browser, { name, url, width, height, waitMs = 1500, hashScroll }) {
  const page = await browser.newPage()
  const consoles = []
  const pageErrors = []
  const failed = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoles.push({ type: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (err) => pageErrors.push(String(err)))
  page.on('requestfailed', (req) => {
    failed.push({ url: req.url(), err: req.failure()?.errorText || 'fail' })
  })
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  let navStatus = null
  try {
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 })
    navStatus = res?.status() ?? null
  } catch (error) {
    consoles.push({ type: 'nav', text: String(error) })
  }
  if (hashScroll) {
    await page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ block: 'start' })
    }, hashScroll).catch(() => {})
  }
  await new Promise((r) => setTimeout(r, waitMs))
  const stamp = await page
    .evaluate(() => {
      const el = document.querySelector('[data-ui-build]')
      const footer = document.querySelector('footer')?.innerText || ''
      const buildMatch = footer.match(/UI\s+([0-9.]+[a-z0-9-]*)/i)
      return {
        dataUiBuild: el?.getAttribute('data-ui-build') || null,
        footerBuild: buildMatch?.[1] || null,
        title: document.title,
        bodyText: (document.body?.innerText || '').slice(0, 1200),
      }
    })
    .catch((e) => ({ error: String(e) }))
  const shotPath = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: shotPath, fullPage: false })
  await page.close()
  const entry = {
    name,
    url,
    width,
    height,
    navStatus,
    shotPath: path.relative(root, shotPath),
    stamp,
    consoles: consoles.slice(0, 30),
    pageErrors: pageErrors.slice(0, 20),
    failedRequests: failed.filter((f) => !f.url.includes('favicon')).slice(0, 20),
  }
  results.pages.push(entry)
  console.log('SHOT', name, navStatus, stamp?.footerBuild || stamp?.dataUiBuild || '')
  return entry
}

async function e2eLocal(browser) {
  const page = await browser.newPage()
  const notes = []
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 })
  await page.goto(`${LOCAL}/#editor`, { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 1200))

  // Ensure editor visible
  const editorVisible = await page.evaluate(() => {
    const el = document.querySelector('#editor') || document.querySelector('[data-editor]') || document.querySelector('.editor-card')
    el?.scrollIntoView({ block: 'start' })
    return Boolean(el)
  })
  notes.push({ step: 'open-editor', ok: editorVisible })
  await page.screenshot({ path: path.join(outDir, 'local-editor-open.png') })

  // Find title input and type
  const titleTyped = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input, textarea')]
    const title =
      inputs.find((el) => /title/i.test(el.getAttribute('aria-label') || '')) ||
      inputs.find((el) => /title/i.test(el.getAttribute('placeholder') || '')) ||
      inputs.find((el) => /title/i.test(el.name || '')) ||
      document.querySelector('#title-text') ||
      document.querySelector('[data-title-input]')
    if (!title) return { ok: false, reason: 'no-title-input' }
    title.focus()
    title.value = 'AUDIT TITLE CLICK'
    title.dispatchEvent(new Event('input', { bubbles: true }))
    title.dispatchEvent(new Event('change', { bubbles: true }))
    return { ok: true, tag: title.tagName, id: title.id, placeholder: title.placeholder }
  })
  notes.push({ step: 'title-edit', ...titleTyped })

  // Prefer React-friendly typing via keyboard if found
  const titleSelectorCandidates = [
    'input[aria-label*="itle" i]',
    'textarea[aria-label*="itle" i]',
    'input[placeholder*="itle" i]',
    '#title-text',
    '[data-title-input]',
  ]
  let typedOk = false
  for (const sel of titleSelectorCandidates) {
    const handle = await page.$(sel)
    if (!handle) continue
    await handle.click({ clickCount: 3 })
    await page.keyboard.type('AUDIT TITLE CLICK', { delay: 10 })
    typedOk = true
    notes.push({ step: 'title-keyboard', selector: sel, ok: true })
    break
  }
  if (!typedOk) notes.push({ step: 'title-keyboard', ok: false })

  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: path.join(outDir, 'local-editor-title.png') })

  // More title options — measure layout shift
  const moreBefore = await page.evaluate(() => ({
    scrollH: document.documentElement.scrollHeight,
    bodyH: document.body.scrollHeight,
  }))
  const moreClicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, summary, [role="button"]')]
    const btn = buttons.find((el) => /more.*option|more title|line 2|advanced/i.test(el.textContent || ''))
    if (!btn) return { ok: false, reason: 'no-more-button', texts: buttons.map((b) => (b.textContent || '').trim()).filter(Boolean).slice(0, 40) }
    btn.click()
    return { ok: true, text: (btn.textContent || '').trim() }
  })
  notes.push({ step: 'more-options-click', ...moreClicked })
  await new Promise((r) => setTimeout(r, 500))
  const moreAfter = await page.evaluate(() => ({
    scrollH: document.documentElement.scrollHeight,
    bodyH: document.body.scrollHeight,
    popoverOpen: Boolean(
      document.querySelector('.title-options-popover, .inspector-advanced.is-open, [data-title-options]'),
    ),
    detailsOpen: Boolean(document.querySelector('details[open]')),
  }))
  const deltaH = moreAfter.scrollH - moreBefore.scrollH
  notes.push({
    step: 'more-options-layout',
    before: moreBefore,
    after: moreAfter,
    deltaScrollH: deltaH,
    ok: deltaH < 80, // allow tiny noise; popover should not grow page
  })
  await page.screenshot({ path: path.join(outDir, 'local-editor-more-options.png') })

  // Upload a tiny canvas-generated PNG via file input if present
  const uploadInfo = await page.evaluate(() => {
    const input = document.querySelector('input[type="file"]')
    return input
      ? { ok: true, accept: input.accept || '', id: input.id || null }
      : { ok: false, reason: 'no-file-input' }
  })
  notes.push({ step: 'file-input', ...uploadInfo })
  if (uploadInfo.ok) {
    // Create a temp PNG and upload
    const pngPath = path.join(outDir, '_fixture-upload.png')
    // 1x1 PNG
    const b64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    fs.writeFileSync(pngPath, Buffer.from(b64, 'base64'))
    const input = await page.$('input[type="file"]')
    if (input) {
      await input.uploadFile(pngPath)
      await new Promise((r) => setTimeout(r, 800))
      notes.push({ step: 'upload-fixture', ok: true })
      await page.screenshot({ path: path.join(outDir, 'local-editor-upload.png') })
    }
  }

  // Download / export gate probe (do not complete paywall flow destructively)
  const downloadProbe = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button, a')]
    const btn = buttons.find((el) => /download|export|save png|save jpg/i.test(el.textContent || ''))
    if (!btn) return { ok: false, reason: 'no-download', sample: buttons.map((b) => (b.textContent || '').trim()).filter(Boolean).slice(0, 30) }
    return {
      ok: true,
      text: (btn.textContent || '').trim(),
      disabled: Boolean(btn.disabled),
      classes: btn.className,
    }
  })
  notes.push({ step: 'download-gate-visible', ...downloadProbe })
  if (downloadProbe.ok) {
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button, a')]
      const btn = buttons.find((el) => /download|export|save png|save jpg/i.test(el.textContent || ''))
      btn?.click()
    })
    await new Promise((r) => setTimeout(r, 700))
    const gate = await page.evaluate(() => {
      const text = document.body.innerText || ''
      return {
        hasModal: Boolean(document.querySelector('[role="dialog"], .modal, .export-modal, .auth-modal')),
        mentionsSignIn: /sign in|create account|upgrade|free downloads|limit/i.test(text),
        snippet: text.slice(0, 500),
      }
    })
    notes.push({ step: 'download-click', ...gate })
    await page.screenshot({ path: path.join(outDir, 'local-editor-download-gate.png') })
  }

  // AI maker page light probe
  await page.goto(`${LOCAL}/ai-thumbnail-maker/`, { waitUntil: 'networkidle2', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 1000))
  const aiProbe = await page.evaluate(() => {
    const text = document.body.innerText || ''
    const ready = /free preview|pro imaging|generate|describe/i.test(text)
    const input = document.querySelector('textarea, input[type="text"]')
    return {
      ok: ready,
      hasInput: Boolean(input),
      chip: (document.querySelector('[data-ai-ready], .ai-ready, .provider-chip')?.textContent || '').trim(),
      headline: (document.querySelector('h1')?.textContent || '').trim(),
    }
  })
  notes.push({ step: 'ai-maker', ...aiProbe })
  await page.screenshot({ path: path.join(outDir, 'local-ai-maker.png') })

  // Optional demo result path
  await page.goto(`${LOCAL}/ai-thumbnail-maker/?demoResult=1`, {
    waitUntil: 'networkidle2',
    timeout: 45000,
  })
  await new Promise((r) => setTimeout(r, 1500))
  const demo = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-concept], .concept-card, .look-card, .ai-result')
    return {
      cardCount: cards.length,
      textHasConcepts: /strategy|headline|open in editor|concept/i.test(document.body.innerText || ''),
    }
  })
  notes.push({ step: 'ai-demo-result', ...demo })
  await page.screenshot({ path: path.join(outDir, 'local-ai-demo.png') })

  await page.close()
  results.e2e = { notes, at: new Date().toISOString() }
  console.log('E2E done', JSON.stringify(notes, null, 2))
}

async function main() {
  const routes = [
    '/',
    '/ai-thumbnail-maker/',
    '/pricing/',
    '/tools/',
    '/thumbnail-doctor/',
    '/projects/',
    '/youtube-thumbnail-score/',
    '/youtube-thumbnail-resizer/',
    '/youtube-ctr-calculator/',
    '/youtube-title-analyzer/',
    '/roast/demo-code/',
  ]
  for (const base of [PROD, LOCAL]) {
    for (const route of routes) {
      const row = await fetchRoute(base, route)
      results.routes.push(row)
      console.log('ROUTE', row.status, row.ok, base, route)
    }
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/local/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  try {
    if (MODE === 'prod' || MODE === 'all') {
      const prodShots = [
        ['prod-home-1280', `${PROD}/`, 1280, 900],
        ['prod-editor-1280', `${PROD}/#editor`, 1280, 1000],
        ['prod-ai-maker-1280', `${PROD}/ai-thumbnail-maker/`, 1280, 900],
        ['prod-pricing-1280', `${PROD}/pricing/`, 1280, 900],
        ['prod-tools-1280', `${PROD}/tools/`, 1280, 900],
        ['prod-doctor-1280', `${PROD}/thumbnail-doctor/`, 1280, 900],
        ['prod-home-390', `${PROD}/`, 390, 844],
        ['prod-ai-maker-390', `${PROD}/ai-thumbnail-maker/`, 390, 844],
        ['prod-pricing-390', `${PROD}/pricing/`, 390, 844],
        ['prod-roast-1280', `${PROD}/roast/demo-code/`, 1280, 900],
      ]
      for (const [name, url, w, h] of prodShots) {
        await shotPage(browser, {
          name,
          url,
          width: w,
          height: h,
          waitMs: 1800,
          hashScroll: url.includes('#editor') ? '#editor' : undefined,
        })
      }
    }

    if (MODE === 'local' || MODE === 'all' || MODE === 'e2e') {
      const localShots = [
        ['local-home-1280', `${LOCAL}/`, 1280, 900],
        ['local-pricing-1280', `${LOCAL}/pricing/`, 1280, 900],
        ['local-tools-1280', `${LOCAL}/tools/`, 1280, 900],
      ]
      if (MODE !== 'e2e') {
        for (const [name, url, w, h] of localShots) {
          await shotPage(browser, { name, url, width: w, height: h, waitMs: 1200 })
        }
      }
      await e2eLocal(browser)
    }
  } finally {
    await browser.close()
  }

  results.finishedAt = new Date().toISOString()
  const jsonPath = path.join(outDir, 'audit-raw.json')
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))
  console.log('WROTE', jsonPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
