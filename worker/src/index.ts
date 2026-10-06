/**
 * Thumbric lightweight API — Cloudflare Worker
 * - POST /api/register  → append user to JSON list in KV
 * - GET  /api/users     → list users (protect later)
 *
 * Deploy: cd worker && npx wrangler deploy
 * Bind KV namespace id in wrangler.toml after `wrangler kv namespace create THUMBRIC_USERS`
 */

export interface Env {
  THUMBRIC_USERS: KVNamespace
  ADMIN_TOKEN?: string
}

type UserRow = {
  name: string
  email: string
  createdAt: string
}

const USERS_KEY = 'users.json'

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

async function readUsers(env: Env): Promise<UserRow[]> {
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
  await env.THUMBRIC_USERS.put(USERS_KEY, JSON.stringify(users, null, 2))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '') || '/'

    if (request.method === 'POST' && (path === '/api/register' || path === '/register')) {
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
        createdAt: existing >= 0 ? users[existing].createdAt : new Date().toISOString(),
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

    if (path === '/' || path === '/api') {
      return json({
        service: 'thumbric-api',
        endpoints: ['POST /api/register', 'GET /api/users'],
      })
    }

    return json({ error: 'Not found' }, 404)
  },
}
