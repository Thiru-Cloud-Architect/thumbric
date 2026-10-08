import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getSupabase, isSupabaseConfigured } from './supabaseClient'
import {
  clearSimpleUser,
  loadSimpleUser,
  registerSimpleUser,
  type SimpleUser,
} from './simpleAuth'
import { registerEmail } from './entitlement'

export type AuthUser = {
  id: string
  name: string
  email: string
  provider: 'supabase' | 'local'
  createdAt: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  supabaseReady: boolean
  signUp: (name: string, email: string, password?: string) => Promise<AuthUser>
  signIn: (email: string, password?: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  requireAuth: () => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(user: SimpleUser, provider: AuthUser['provider'], id?: string): AuthUser {
  return {
    id: id || `local:${user.email}`,
    name: user.name,
    email: user.email,
    provider,
    createdAt: user.createdAt,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseReady = isSupabaseConfigured()

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const sb = getSupabase()
      if (sb) {
        const { data } = await sb.auth.getSession()
        if (!cancelled && data.session?.user) {
          const email = data.session.user.email || ''
          const name =
            (data.session.user.user_metadata?.name as string | undefined) ||
            email.split('@')[0] ||
            'Creator'
          setUser({
            id: data.session.user.id,
            name,
            email: email.toLowerCase(),
            provider: 'supabase',
            createdAt: data.session.user.created_at || new Date().toISOString(),
          })
        }
        const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
          if (!session?.user) {
            setUser(null)
            return
          }
          const email = session.user.email || ''
          const name =
            (session.user.user_metadata?.name as string | undefined) ||
            email.split('@')[0] ||
            'Creator'
          setUser({
            id: session.user.id,
            name,
            email: email.toLowerCase(),
            provider: 'supabase',
            createdAt: session.user.created_at || new Date().toISOString(),
          })
        })
        if (!cancelled) setLoading(false)
        return () => sub.subscription.unsubscribe()
      }

      const local = loadSimpleUser()
      if (!cancelled) {
        setUser(local ? toAuthUser(local, 'local') : null)
        setLoading(false)
      }
      return undefined
    }

    const cleanup = boot()
    return () => {
      cancelled = true
      void cleanup.then((fn) => fn?.())
    }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password?: string) => {
    const sb = getSupabase()
    if (sb && password) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Could not create account.')
      registerEmail(email)
      const next: AuthUser = {
        id: data.user.id,
        name: name.trim() || email.split('@')[0] || 'Creator',
        email: email.trim().toLowerCase(),
        provider: 'supabase',
        createdAt: data.user.created_at || new Date().toISOString(),
      }
      setUser(next)
      return next
    }

    // Local / magic-link-less fallback (works without Supabase env).
    const local = await registerSimpleUser(name, email)
    registerEmail(email)
    const next = toAuthUser(local, sb ? 'supabase' : 'local')
    if (sb && !password) {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          data: { name: name.trim() },
          shouldCreateUser: true,
        },
      })
      if (error) {
        // Still keep local session so the creator can save today.
        setUser(next)
        return next
      }
      next.provider = 'supabase'
    }
    setUser(next)
    return next
  }, [])

  const signIn = useCallback(async (email: string, password?: string) => {
    const sb = getSupabase()
    if (sb && password) {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Could not sign in.')
      registerEmail(email)
      const name =
        (data.user.user_metadata?.name as string | undefined) ||
        email.split('@')[0] ||
        'Creator'
      const next: AuthUser = {
        id: data.user.id,
        name,
        email: email.trim().toLowerCase(),
        provider: 'supabase',
        createdAt: data.user.created_at || new Date().toISOString(),
      }
      setUser(next)
      return next
    }

    const existing = loadSimpleUser()
    if (existing && existing.email === email.trim().toLowerCase()) {
      registerEmail(email)
      const next = toAuthUser(existing, 'local')
      setUser(next)
      return next
    }
    // First-time “sign in” without password → register locally.
    const local = await registerSimpleUser(email.split('@')[0] || 'Creator', email)
    registerEmail(email)
    const next = toAuthUser(local, 'local')
    setUser(next)
    return next
  }, [])

  const signOut = useCallback(async () => {
    const sb = getSupabase()
    if (sb) await sb.auth.signOut()
    clearSimpleUser()
    setUser(null)
  }, [])

  const requireAuth = useCallback(() => Boolean(user), [user])

  const value = useMemo(
    () => ({ user, loading, supabaseReady, signUp, signIn, signOut, requireAuth }),
    [user, loading, supabaseReady, signUp, signIn, signOut, requireAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
