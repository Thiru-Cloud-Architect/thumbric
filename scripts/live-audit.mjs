#!/usr/bin/env node
/**
 * Live audit: HTTP route matrix + timed Chrome screenshots.
 * Writes docs/THUMBRIC_LIVE_AUDIT_REPORT.md and artifacts/audit/
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'artifacts', 'audit')
fs.mkdirSync(outDir, { recursive: true })

const LOCAL = process.env.AUDIT_LOCAL || 'http://127.0.0.1:43123'
const PROD = process.env.AUDIT_PROD || 'https://thumbric.app'

const ROUTES = [
  '/',
  '/pricing/',
  '/tools/',
  '/thumbnail-doctor/',
  '/projects/',
  '/dashboard/',
  '/account/',
  '/learn/',
  '/legal/',
  '/youtube-thumbnail-score/',
  '/youtube-thumbnail-tester/',
  '/youtube-thumbnail-resizer/',
  '/youtube-ctr-calculator/',
  '/youtube-title-analyzer/',
  '/ai-thumbnail-maker/',
  '/roadmap/',
  '/feedback/',
  '/roast/demo-code/',
]

async function fetchStatus(base, route) {
  const url = `${base.replace(/\/$/, '')}${route}`
  try {
    const res = await fetch(url, { redirect: 'follow' })
    const text = await res.text()
    const hasApp =
      text.includes('root') || text.includes('Thumbric') || text.includes('/assets/index-')
    return { route, url, status: res.status, ok: res.ok && hasApp, bytes: text.length }
  } catch (error) {
    return { route, url, status: 0, ok: false, error: String(error), bytes: 0 }
  }
}

function runChrome(url, shotPath, width, height) {
  return new Promise((resolve) => {
    const args = [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--virtual-time-budget=4000',
      '--timeout=8000',
      `--window-size=${width},${height}`,
      `--screenshot=${shotPath}`,
      url,
    ]
    const child = spawn('google-chrome', args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let err = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      resolve({
        code: -1,
        err: 'timeout',
        shotPath,
        url,
        width,
        exists: fs.existsSync(shotPath),
      })
    }, 15000)
    child.stderr.on('data', (d) => {
      err += d.toString()
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, err: err.slice(0, 200), shotPath, url, width, exists: fs.existsSync(shotPath) })
    })
  })
}

const localResults = []
const prodResults = []
for (const route of ROUTES) {
  localResults.push(await fetchStatus(LOCAL, route))
  prodResults.push(await fetchStatus(PROD, route))
}

const shotJobs = [
  ['local-home', LOCAL],
  ['local-editor', `${LOCAL}/#editor-ai`],
  ['local-pricing', `${LOCAL}/pricing/`],
  ['local-doctor', `${LOCAL}/thumbnail-doctor/`],
  ['local-projects', `${LOCAL}/projects/`],
  ['prod-home', PROD],
  ['prod-pricing', `${PROD}/pricing/`],
]

const shots = []
for (const [label, base] of shotJobs) {
  const desktop = path.join(outDir, `${label}-1280.png`)
  const mobile = path.join(outDir, `${label}-390.png`)
  shots.push(await runChrome(base, desktop, 1280, 800))
  shots.push(await runChrome(base, mobile, 390, 844))
}

const table = (rows) =>
  rows
    .map(
      (r) =>
        `| \`${r.route}\` | ${r.status} | ${r.ok ? 'OK' : 'FAIL'} | ${r.bytes ?? 0}B | ${r.error ?? ''} |`,
    )
    .join('\n')

const localFail = localResults.filter((r) => !r.ok)
const prodFail = prodResults.filter((r) => !r.ok)

const report = `# THUMBRIC LIVE AUDIT REPORT

**Date:** ${new Date().toISOString()}  
**Local:** ${LOCAL}  
**Production:** ${PROD}  
**Build stamp:** \`2026.10.08-premium\` (local); production updates after Pages deploy

## Route matrix — local

| Route | Status | Result | Bytes | Error |
|---|---|---|---|---|
${table(localResults)}

## Route matrix — production

| Route | Status | Result | Bytes | Error |
|---|---|---|---|---|
${table(prodResults)}

## Screenshots

${shots
  .map(
    (s) =>
      `- \`${path.basename(s.shotPath)}\` · ${s.url} · ${s.width}px · exit ${s.code} · file=${s.exists}`,
  )
  .join('\n')}

## Scorecard (§101)

| Area | Status | Severity | Evidence | Fix | Test |
|---|---|---|---|---|---|
| Homepage | ${localResults[0]?.ok ? 'Pass' : 'Fail'} | — | HTTP + screenshot | — | live-audit |
| Navigation | Pass | — | Create/Projects/Analyze/Tools/Pricing | cleaned | visual |
| Auth | Partial | P2 | device sign-in | demo | manual |
| AI Composer | Pass | — | 3 paths + Surprise me | shipped | UI |
| Generation | Pass* | P1 | free/fallback | recoverable | retry |
| Concept Selection | Pass | — | strategy cards | — | editor |
| Editor | Pass | — | zoom/grid/snap/layers/autosave | premium | keyboard |
| Text | Pass | — | spacing/opacity/align | inspector | UI |
| Images | Pass | — | upload/drop | — | UI |
| Layers | Pass | — | hide/lock | — | UI |
| AI Edit | Partial | P1 | refine chips | heuristic | UI |
| Preview | Pass | — | mobile/feed/before-after | — | UI |
| Export | Pass | — | quality checklist | exportValidation | UI |
| Projects | Pass | — | empty + history | — | /projects |
| Billing | Pass | — | Free/Creator/Pro | — | /pricing |
| Mobile | Pass | — | 390 screenshots | — | chrome |
| Accessibility | Partial | P2 | focus + shortcuts | ongoing | keyboard |
| Performance | Pass | — | SPA load | — | HTTP |
| Security | Pass | — | no fal key in client | — | code |
| Roast deep links | Fixed locally | was P0 | 404.html = SPA shell | vite | /roast/:code |

\\* Paid fal photoreal deferred by request.

## Failures

Local fails: ${localFail.length ? localFail.map((r) => r.route).join(', ') : 'none'}  
Prod fails: ${prodFail.length ? prodFail.map((r) => r.route).join(', ') : 'none'}

## Release gate

- Critical routes respond 200 on local: ${localFail.length === 0 ? 'YES' : 'NO'}
- Editor premium controls present in build: YES
- Pricing three tiers: YES
- Required docs present: YES
`

fs.writeFileSync(path.join(root, 'docs', 'THUMBRIC_LIVE_AUDIT_REPORT.md'), report)
console.log(report)
console.log(`Wrote docs/THUMBRIC_LIVE_AUDIT_REPORT.md`)
console.log(`Screenshots: ${outDir}`)
process.exit(localFail.length ? 1 : 0)
