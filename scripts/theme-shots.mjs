#!/usr/bin/env node
/** Capture light/dark desktop screenshots via Chrome CDP. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import WebSocket from 'ws'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDirs = [
  path.join(root, '.walkthrough', 'coral-pass'),
  path.join(root, 'artifacts', 'coral-pass'),
]
for (const d of outDirs) fs.mkdirSync(d, { recursive: true })

const BASE = process.env.SHOT_BASE || 'http://127.0.0.1:43201'
const PORT = 9333
const WIDTH = 1440
const HEIGHT = 900

const shots = [
  { name: 'light-home', theme: 'light', path: '/' },
  { name: 'light-how', theme: 'light', path: '/#how' },
  { name: 'light-editor', theme: 'light', path: '/#editor' },
  { name: 'light-pricing', theme: 'light', path: '/pricing/' },
  { name: 'dark-home', theme: 'dark', path: '/' },
  { name: 'dark-how', theme: 'dark', path: '/#how' },
  { name: 'dark-editor', theme: 'dark', path: '/#editor' },
  { name: 'dark-pricing', theme: 'dark', path: '/pricing/' },
]

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function waitForCdp() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* retry */
    }
    await sleep(250)
  }
  throw new Error('CDP not ready')
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    let nextId = 0
    const pending = new Map()
    ws.on('open', () => {
      const send = (method, params = {}) =>
        new Promise((res, rej) => {
          const id = ++nextId
          pending.set(id, { res, rej })
          ws.send(JSON.stringify({ id, method, params }))
        })
      resolve({ ws, send })
    })
    ws.on('message', (raw) => {
      const msg = JSON.parse(String(raw))
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id)
        pending.delete(msg.id)
        if (msg.error) rej(new Error(JSON.stringify(msg.error)))
        else res(msg.result)
      }
    })
    ws.on('error', reject)
  })
}

async function capture(send, shot) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await send('Page.enable')
  await send('Runtime.enable')

  // Seed theme on blank page first for same-origin after navigate
  await send('Page.navigate', { url: `${BASE}/` })
  await sleep(1000)
  await send('Runtime.evaluate', {
    expression: `localStorage.setItem('thumbric-theme','${shot.theme}');document.documentElement.setAttribute('data-theme','${shot.theme}');`,
  })

  const url = `${BASE}${shot.path}`
  await send('Page.navigate', { url })
  await sleep(1200)
  await send('Runtime.evaluate', {
    expression: `(() => {
      localStorage.setItem('thumbric-theme', '${shot.theme}');
      document.documentElement.setAttribute('data-theme', '${shot.theme}');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', '${shot.theme}' === 'dark' ? '#0d0a0a' : '#fff1ea');
      return document.documentElement.getAttribute('data-theme');
    })()`,
    returnByValue: true,
  })
  if (shot.path.includes('#')) {
    const hash = shot.path.split('#')[1]
    await send('Runtime.evaluate', {
      expression: `(() => {
        const id = '${hash}';
        location.hash = id;
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
        return !!el;
      })()`,
      returnByValue: true,
    })
    await sleep(1100)
  } else {
    await sleep(400)
  }

  if (shot.name.endsWith('home')) {
    const phase = await send('Runtime.evaluate', {
      expression: `!!document.getElementById('video-optional') || /Phase 4 preview|Understand my video/i.test(document.body.innerText)`,
      returnByValue: true,
    })
    const stats = await send('Runtime.evaluate', {
      expression: `/THE PROBLEM|Stop losing views to weak|Free downloads/i.test(document.body.innerText) && !!document.querySelector('.stats-strip,.problem-section')`,
      returnByValue: true,
    })
    console.log(
      shot.name,
      'phase4=',
      phase.result?.value,
      'stats/problem=',
      stats.result?.value,
    )
  }

  const headerBg = await send('Runtime.evaluate', {
    expression: `getComputedStyle(document.querySelector('.top')).backgroundColor`,
    returnByValue: true,
  })
  const panelBg = await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.editor-card .studio-tools');
      return el ? getComputedStyle(el).backgroundColor : 'n/a';
    })()`,
    returnByValue: true,
  })
  console.log(shot.name, 'header=', headerBg.result?.value, 'panel=', panelBg.result?.value)

  const png = await send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  const buf = Buffer.from(png.data, 'base64')
  for (const dir of outDirs) {
    fs.writeFileSync(path.join(dir, `${shot.name}.png`), buf)
  }
  console.log('saved', shot.name, buf.length)
}

async function main() {
  const profile = path.join(root, '.walkthrough', '.chrome-coral')
  fs.rmSync(profile, { recursive: true, force: true })
  fs.mkdirSync(profile, { recursive: true })
  const chrome = spawn(
    'google-chrome',
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${PORT}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
  let stderr = ''
  chrome.stderr.on('data', (d) => {
    stderr += d.toString()
  })

  try {
    await waitForCdp()
    const targets = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json())
    const page = targets.find((t) => t.type === 'page') || targets[0]
    if (!page?.webSocketDebuggerUrl) {
      throw new Error(`No page target: ${JSON.stringify(targets).slice(0, 300)} stderr=${stderr.slice(0, 200)}`)
    }
    const { ws, send } = await connect(page.webSocketDebuggerUrl)
    for (const shot of shots) {
      await capture(send, shot)
    }
    ws.close()
  } finally {
    chrome.kill('SIGKILL')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
