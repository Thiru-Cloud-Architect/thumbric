import { useState } from 'react'
import { Link } from 'react-router-dom'
import { referralUrl, getOrCreateReferralId } from './analytics'
import { PRODUCT_NAME_FULL, SITE_URL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { AuthModal } from './AuthModal'
import { entitlementStatusLabel, loadEntitlement } from './entitlement'
import { planPriceLabel } from './plans'
import { useAuth } from './auth'
import {
  FREE_DAILY_DOWNLOADS,
  FREE_DESIGN_CAP,
  loadDesignCount,
  watermarkDownloadsLeftToday,
} from './usageLimits'
import { isPaid } from './entitlement'
import { loadThumbnailHistory } from './thumbnailHistory'
import './App.css'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const entitlement = loadEntitlement()
  const history = loadThumbnailHistory()
  const refLink = referralUrl(SITE_URL)
  const paid = isPaid(entitlement)

  return (
    <div className="page">
      <DocumentHead path="/account" />
      <SiteHeader
        userLabel={user?.name ?? null}
        onLoginClick={user ? undefined : () => setAuthOpen(true)}
      />
      <AuthModal open={authOpen} reason="generic" onClose={() => setAuthOpen(false)} />
      <main className="account-main tool-page-main">
        <p className="section-eyebrow">Account</p>
        <h1 className="section-title">
          Your <span className="gradient-text">creator profile</span>
        </h1>
        <p className="section-lede">
          {user
            ? 'This is your free account. Downloads include a small Thumbric mark until you upgrade.'
            : 'Sign in to save designs and download. Your photo stays in this browser.'}
        </p>

        <div className="account-grid">
          <article className="tool-card">
            <h2>Profile</h2>
            <p>
              <strong>Name:</strong> {user?.name || 'Guest'}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || entitlement.email || 'Not saved'}
            </p>
            <p>
              <strong>Plan:</strong>{' '}
              {paid ? entitlementStatusLabel(entitlement) : `Free · ${FREE_DAILY_DOWNLOADS} downloads a day`}
            </p>
            <p className="hint">
              Designs started: {loadDesignCount()} of {FREE_DESIGN_CAP} guest designs used before signup.
              {user ? ` Downloads left today: ${watermarkDownloadsLeftToday(true, paid)}.` : ''}
            </p>
            {user ? (
              <button type="button" className="chip" onClick={() => void signOut()}>
                Sign out
              </button>
            ) : null}
            <Link className="chip solid" to="/pricing">
              View pricing · Creator {planPriceLabel('creator', 'INR')}
            </Link>
          </article>

          <article className="tool-card">
            <h2>Referral link</h2>
            <p className="hint">Share Thumbric with another creator.</p>
            <p className="account-ref-id">Your ref: {getOrCreateReferralId()}</p>
            <input className="account-ref-input" readOnly value={refLink} onFocus={(e) => e.target.select()} />
          </article>

          <article className="tool-card">
            <h2>Recent exports</h2>
            {history.length === 0 ? (
              <p className="hint">No downloads yet. Export from the editor after you register.</p>
            ) : (
              <ul className="history-list">
                {history
                  .slice()
                  .reverse()
                  .slice(0, 6)
                  .map((item) => (
                    <li key={item.id}>
                      <img src={item.previewDataUrl} alt="" width={120} height={68} />
                      <div>
                        <strong>{item.title || 'Untitled'}</strong>
                        <span>
                          {item.platform} · {item.clean ? 'clean' : 'preview'} ·{' '}
                          {new Date(item.ts).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
            <Link to="/dashboard">Open creator dashboard →</Link>
          </article>
        </div>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
