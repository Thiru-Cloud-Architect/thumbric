import { useState, type FormEvent } from 'react'
import { useAuth } from './auth'
import { FREE_DAILY_DOWNLOADS, FREE_DESIGN_CAP } from './usageLimits'
import { isSupabaseConfigured } from './supabaseClient'

type AuthModalProps = {
  open: boolean
  reason?: 'save' | 'download' | 'design-cap' | 'generic'
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ open, reason = 'generic', onClose, onSuccess }: AuthModalProps) {
  const { signUp, signIn, supabaseReady } = useAuth()
  const [mode, setMode] = useState<'register' | 'signin'>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  if (!open) return null

  const headline =
    reason === 'save'
      ? 'Register to save your design'
      : reason === 'download'
        ? 'Register to download'
        : reason === 'design-cap'
          ? `Free design limit reached (${FREE_DESIGN_CAP})`
          : 'Create your free Thumbric account'

  const blurb =
    reason === 'download'
      ? `Free accounts get ${FREE_DAILY_DOWNLOADS} mild-watermarked PNGs per day. Upgrade anytime for clean exports.`
      : reason === 'save'
        ? 'Keep projects across sessions. Free forever to edit — downloads use a light Thumbric mark until you upgrade.'
        : reason === 'design-cap'
          ? 'Register free to keep creating, save projects, and download with a light watermark.'
          : `Create up to ${FREE_DESIGN_CAP} designs as a guest. Register to save and download ${FREE_DAILY_DOWNLOADS}/day.`

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNote('')
    try {
      if (mode === 'register') {
        await signUp(name || email.split('@')[0] || 'Creator', email, password || undefined)
        if (supabaseReady && !password) {
          setNote('Check your email for a magic link if Supabase mail is enabled. You are signed in on this device now.')
        }
      } else {
        await signIn(email, password || undefined)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not continue.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="auth-modal-kicker">{isSupabaseConfigured() ? 'Supabase account' : 'Free account'}</p>
        <h2 id="auth-modal-title">{headline}</h2>
        <p className="auth-modal-blurb">{blurb}</p>
        <div className="auth-mode-row" role="tablist">
          <button
            type="button"
            className={mode === 'register' ? 'chip solid' : 'chip'}
            onClick={() => setMode('register')}
          >
            Sign up
          </button>
          <button
            type="button"
            className={mode === 'signin' ? 'chip solid' : 'chip'}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          {mode === 'register' ? (
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
          ) : null}
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@channel.com"
              autoComplete="email"
            />
          </label>
          {supabaseReady ? (
            <label>
              Password {mode === 'signin' ? '' : '(optional — leave blank for magic link)'}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'signin' ? 'Your password' : 'Min 6 characters'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={mode === 'register' && password ? 6 : undefined}
              />
            </label>
          ) : (
            <p className="auth-fallback-note">
              Free account on this browser. You can save designs and download after you sign up.
            </p>
          )}
          {error ? <p className="auth-error">{error}</p> : null}
          {note ? <p className="auth-note">{note}</p> : null}
          <div className="auth-actions">
            <button type="submit" className="primary" disabled={busy}>
              {busy ? 'Working…' : mode === 'register' ? 'Create free account' : 'Sign in'}
            </button>
            <button type="button" className="chip" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
