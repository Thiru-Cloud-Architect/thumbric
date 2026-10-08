import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
const anon = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

/** True when real Supabase credentials are present in the build. */
export function isSupabaseConfigured() {
  return Boolean(url && anon)
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
