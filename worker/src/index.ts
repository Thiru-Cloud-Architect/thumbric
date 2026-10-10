/**
 * Thumbric lightweight API — Cloudflare Worker
 * - POST /api/register  → append user to JSON list in KV
 * - GET  /api/users     → list users (protect later)
 * - POST /api/ai/image  → premium image gen (fal.ai Flux Schnell, or Workers AI)
 *
 * Secrets (never commit):
 *   npx wrangler secret put FAL_KEY
 * Optional: bind Workers AI in wrangler.toml (`[ai] binding = "AI"`).
 *
 * Deploy: cd worker && npx wrangler deploy
 */

export interface Env {
  THUMBRIC_USERS?: KVNamespace
  ADMIN_TOKEN?: string
  FAL_KEY?: string
  AI?: {
    run: (model: string, input: Record<string, unknown>) => Promise<unknown>
  }
}

type UserRow = {
  name: string
  email: string
  createdAt: string
}

const USERS_KEY = 'users.json'
const FAL_MODEL = 'fal-ai/flux/schnell'
const CF_FLUX = '@cf/black-forest-labs/flux-1-schnell'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...cors },
  })
}

function imageResponse(bytes: ArrayBuffer | Uint8Array, contentType: string) {
  const body = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': contentType,
      'cache-control': 'no-store',
      ...cors,
    },
  })
}

async function readUsers(env: Env): Promise<UserRow[]> {
  if (!env.THUMBRIC_USERS) return []
  const raw = await env.THUMBRIC_USERS.get(USERS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as UserRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeUsers(env: Env, users: UserRow[]) {
  if (!env.THUMBRIC_USERS) throw new Error('KV is not bound')
  await env.THUMBRIC_USERS.put(USERS_KEY, JSON.stringify(users, null, 2))
}

type AiBody = {
  prompt?: string
  width?: number
  height?: number
  seed?: number
}

function clampSize(value: unknown, fallback: number, max: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(256, Math.round(n)))
}

async function bytesFromDataOrUrl(url: string) {
  if (url.startsWith('data:')) {
    const comma = url.indexOf(',')
    const meta = url.slice(0, comma)
    const payload = url.slice(comma + 1)
    const mime = /data:([^;]+)/.exec(meta)?.[1] || 'image/jpeg'
    const binary = atob(payload)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return { bytes, mime }
  }
  const img = await fetch(url)
  if (!img.ok) throw new Error('Could not fetch generated image')
  const mime = img.headers.get('content-type') || 'image/jpeg'
  return { bytes: new Uint8Array(await img.arrayBuffer()), mime }
}

async function generateWithFal(env: Env, prompt: string, width: number, height: number, seed: number) {
  const response = await fetch(`https://fal.run/${FAL_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${env.FAL_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: { width, height },
      num_images: 1,
      seed,
      sync_mode: true,
      output_format: 'jpeg',
      num_inference_steps: 4,
      enable_safety_checker: true,
      guidance_scale: 3.5,
    }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`fal ${response.status} ${detail.slice(0, 180)}`)
  }
  const data = (await response.json()) as { images?: Array<{ url?: string }> }
  const url = data.images?.[0]?.url
  if (!url) throw new Error('fal returned no image')
  return bytesFromDataOrUrl(url)
}

async function generateWithWorkersAi(env: Env, prompt: string, seed: number) {
  if (!env.AI) throw new Error('Workers AI is not bound')
  const result = (await env.AI.run(CF_FLUX, {
    prompt,
    seed,
  })) as { image?: string }
  if (!result?.image) throw new Error('Workers AI returned no image')
  const binary = atob(result.image)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return { bytes, mime: 'image/jpeg' }
}

async function handleAiImage(request: Request, env: Env) {
  if (!env.FAL_KEY && !env.AI) {
    return json(
      {
        error: 'no_premium_backend',
        hint: 'Set FAL_KEY (`wrangler secret put FAL_KEY`) or bind Workers AI.',
      },
      501,
    )
  }

  let body: AiBody
  try {
    body = (await request.json()) as AiBody
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  const prompt = String(body.prompt || '').trim()
  if (prompt.length < 8) return json({ error: 'prompt required' }, 400)
  const width = clampSize(body.width, 1280, 1280)
  const height = clampSize(body.height, 720, 1280)
  const seed = Number.isFinite(Number(body.seed)) ? Math.round(Number(body.seed)) : Math.floor(Math.random() * 1_000_000)

  try {
    const generated = env.FAL_KEY
      ? await generateWithFal(env, prompt, width, height, seed)
      : await generateWithWorkersAi(env, prompt, seed)
    return imageResponse(generated.bytes, generated.mime)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'generate_failed'
    const billingLocked = /TOP_UP|locked|exhausted|payment|balance/i.test(message)
    return json(
      {
        error: billingLocked ? 'billing_required' : 'generate_failed',
        hint: billingLocked
          ? 'fal.ai account needs a balance top-up at https://fal.ai/dashboard/billing'
          : 'Image generation failed. Retry shortly or check Worker logs.',
      },
      502,
    )
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '') || '/'

    if (request.method === 'POST' && (path === '/api/ai/image' || path === '/ai/image')) {
      return handleAiImage(request, env)
    }

    if (request.method === 'POST' && (path === '/api/events' || path === '/events')) {
      let body: { name?: string; props?: Record<string, unknown>; ts?: number }
      try {
        body = (await request.json()) as { name?: string; props?: Record<string, unknown>; ts?: number }
      } catch {
        return json({ error: 'Invalid JSON' }, 400)
      }
      const name = String(body.name || '').trim().slice(0, 80)
      if (!name) return json({ error: 'event name required' }, 400)
      if (!env.THUMBRIC_USERS) return json({ ok: true, stored: false })
      const row = {
        name,
        props: body.props && typeof body.props === 'object' ? body.props : {},
        ts: Number(body.ts) || Date.now(),
      }
      const raw = (await env.THUMBRIC_USERS.get('events.json')) || '[]'
      let events: unknown[] = []
      try {
        const parsed = JSON.parse(raw) as unknown
        events = Array.isArray(parsed) ? parsed : []
      } catch {
        events = []
      }
      events.push(row)
      if (events.length > 400) events = events.slice(events.length - 400)
      await env.THUMBRIC_USERS.put('events.json', JSON.stringify(events))
      return json({ ok: true, stored: true })
    }

    if (request.method === 'POST' && (path === '/api/register' || path === '/register')) {
      if (!env.THUMBRIC_USERS) return json({ error: 'KV is not bound' }, 501)
      let body: Partial<UserRow>
      try {
        body = (await request.json()) as Partial<UserRow>
      } catch {
        return json({ error: 'Invalid JSON' }, 400)
      }
      const name = String(body.name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Valid name and email required' }, 400)
      }

      const users = await readUsers(env)
      const existing = users.findIndex((u) => u.email === email)
      const row: UserRow = {
        name,
        email,
        createdAt: existing >= 0 ? users[existing]!.createdAt : new Date().toISOString(),
      }
      if (existing >= 0) users[existing] = { ...users[existing], ...row }
      else users.push(row)
      await writeUsers(env, users)
      return json({ ok: true, user: row, total: users.length })
    }

    if (request.method === 'GET' && (path === '/api/users' || path === '/users')) {
      const auth = request.headers.get('Authorization') || ''
      const token = auth.replace(/^Bearer\s+/i, '')
      if (env.ADMIN_TOKEN && token !== env.ADMIN_TOKEN) {
        return json({ error: 'Unauthorized' }, 401)
      }
      const users = await readUsers(env)
      return json({ users, total: users.length })
    }

    if (request.method === 'GET' && (path === '/api/ai/ready' || path === '/ai/ready')) {
      const fal = Boolean(env.FAL_KEY)
      const workersAi = Boolean(env.AI)
      return json({
        service: 'thumbric-api',
        ready: fal || workersAi,
        backend: fal ? 'fal' : workersAi ? 'workers-ai' : null,
        /** Honest: keys stay server-side; never echo secrets. */
        hint: fal || workersAi
          ? 'Pro imaging ready'
          : 'Set FAL_KEY (`wrangler secret put FAL_KEY`) or bind Workers AI.',
      })
    }

    if (path === '/' || path === '/api') {
      return json({
        service: 'thumbric-api',
        endpoints: [
          'POST /api/register',
          'GET /api/users',
          'POST /api/ai/image',
          'GET /api/ai/ready',
          'POST /api/events',
        ],
        premiumAi: Boolean(env.FAL_KEY || env.AI),
      })
    }

    return json({ error: 'Not found' }, 404)
  },
}
