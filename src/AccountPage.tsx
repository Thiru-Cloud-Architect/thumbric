import { useState } from 'react'
import { Link } from 'react-router-dom'
import { referralUrl, getOrCreateReferralId } from './analytics'
import { PRODUCT_NAME_FULL, SITE_URL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { AuthModal } from './AuthModal'
import { loadEntitlement } from './entitlement'
import { planPriceLabel } from './plans'
import { useBillingCurrency } from './useBillingCurrency'
import { useAuth } from './auth'
import { FREE_DAILY_DOWNLOADS, loadDailyDownloads } from './usageLimits'
import { loadThumbnailHistory } from './thumbnailHistory'
import './App.css'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const { currency } = useBillingCurrency()
  const [authOpen, setAuthOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const entitlement = loadEntitlement()
  const history = loadThumbnailHistory()
  const refLink = referralUrl(SITE_URL)
  const name = user?.name || 'Guest'
  const email = user?.email || entitlement.email || ''
  const initial = name.trim().charAt(0).toUpperCase() || 'T'
  const usedToday = loadDailyDownloads().count
  const leftToday = user ? Math.max(0, FREE_DAILY_DOWNLOADS - usedToday) : 0

  async function copyRef() {
    try {
      await navigator.clipboard.writeText(refLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page">
      <DocumentHead path="/account" />
      <SiteHeader userLabel={user?.name ?? null} onLoginClick={user ? undefined : () => setAuthOpen(true)} />
      <AuthModal open={authOpen} reason="generic" onClose={() => setAuthOpen(false)} />
      <main className="account-home">
        <header className="account-hero">
          <div className="account-avatar" aria-hidden>
            {initial}
          </div>
          <div className="account-identity">
            <p className="account-kicker">Account</p>
            <h1>{name}</h1>
            <p>{email || 'Not signed in'}</p>
          </div>
          <div className="account-hero-side">
            <span className="account-plan">Free</span>
            {user ? (
              <button type="button" className="account-signout" onClick={() => void signOut()}>
                Sign out
              </button>
            ) : (
              <button type="button" className="account-signout" onClick={() => setAuthOpen(true)}>
                Sign in
              </button>
            )}
          </div>
        </header>

        <section className="account-meters" aria-label="Plan summary">
          <article>
            <strong>{user ? leftToday : '—'}</strong>
            <span>downloads left today</span>
          </article>
          <article>
            <strong>{FREE_DAILY_DOWNLOADS}</strong>
            <span>free downloads each day</span>
          </article>
          <article>
            <strong>Free</strong>
            <span>upgrade for a clean PNG</span>
            <Link to="/pricing">See Creator {planPriceLabel('creator', currency)}</Link>
          </article>
        </section>

        <section className="account-work">
          <div className="account-panel">
            <div className="account-panel-head">
              <h2>Recent thumbnails</h2>
              <Link to="/#editor">Create</Link>
            </div>
            {history.length === 0 ? (
              <p className="account-empty">Nothing saved yet. Make one in the editor and it will show up here.</p>
            ) : (
              <ul className="account-thumbs">
                {history
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((item) => (
                    <li key={item.id}>
                      <img src={item.previewDataUrl} alt="" width={160} height={90} />
                      <div>
                        <strong>{item.title || 'Untitled'}</strong>
                        <span>{new Date(item.ts).toLocaleDateString()}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <aside className="account-panel account-invite">
            <h2>Invite a creator</h2>
            <p>Your link: {getOrCreateReferralId()}</p>
            <input readOnly value={refLink} onFocus={(event) => event.target.select()} />
            <button type="button" className="chip solid" onClick={() => void copyRef()}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </aside>
        </section>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
