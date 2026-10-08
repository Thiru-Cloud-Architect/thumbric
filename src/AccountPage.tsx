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
import { isSupabaseConfigured } from './supabaseClient'
import {
  FREE_DAILY_DOWNLOADS,
  FREE_DESIGN_CAP,
  freemiumStatusLabel,
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
        onLoginClick={() => {
          if (user) void signOut()
          else setAuthOpen(true)
        }}
      />
      <AuthModal open={authOpen} reason="generic" onClose={() => setAuthOpen(false)} />
      <main className="account-main tool-page-main">
        <p className="section-eyebrow">Account</p>
        <h1 className="section-title">
          Your <span className="gradient-text">creator profile</span>
        </h1>
        <p className="section-lede">
          {isSupabaseConfigured()
            ? 'Signed in with Supabase when credentials are set.'
            : 'Device account today — add Supabase URL + anon key for cloud auth.'}{' '}
          Free: {FREE_DESIGN_CAP} guest designs · {FREE_DAILY_DOWNLOADS} mild downloads / day after
          register.
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
              <strong>Auth:</strong> {user?.provider || 'none'}
              {isSupabaseConfigured() ? ' · Supabase ready' : ' · local fallback'}
            </p>
            <p>
              <strong>Usage:</strong>{' '}
              {freemiumStatusLabel({
                isRegistered: Boolean(user),
                isPaid: paid,
                planLabel: entitlementStatusLabel(entitlement),
              })}
            </p>
            <p className="hint">
              Designs started: {loadDesignCount()} · Watermarked left today:{' '}
              {user ? watermarkDownloadsLeftToday(true, paid) : 0}
            </p>
            <Link className="chip solid" to="/pricing">
              View pricing · Creator {planPriceLabel('creator', 'INR')}
            </Link>
          </article>

          <article className="tool-card">
            <h2>Referral link</h2>
            <p className="hint">Share Thumbric — attribution stays local until the Worker is live.</p>
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
