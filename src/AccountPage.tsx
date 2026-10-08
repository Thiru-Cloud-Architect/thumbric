import { Link } from 'react-router-dom'
import { referralUrl, getOrCreateReferralId } from './analytics'
import { PRODUCT_NAME_FULL, SITE_URL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { entitlementStatusLabel, loadEntitlement } from './entitlement'
import { planPriceLabel } from './plans'
import { loadSimpleUser } from './simpleAuth'
import { loadThumbnailHistory } from './thumbnailHistory'
import './App.css'

export default function AccountPage() {
  const user = loadSimpleUser()
  const entitlement = loadEntitlement()
  const history = loadThumbnailHistory()
  const refLink = referralUrl(SITE_URL)

  return (
    <div className="page">
      <DocumentHead path="/account" />
      <SiteHeader userLabel={user?.name ?? null} />
      <main className="account-main tool-page-main">
        <p className="section-eyebrow">Account</p>
        <h1 className="section-title">
          Your <span className="gradient-text">creator profile</span>
        </h1>
        <p className="section-lede">
          Device-only sign-in today — no server vault yet. Exports, brand kit, and analytics stay in this browser until
          paid checkout ships.
        </p>

        <div className="account-grid">
          <article className="tool-card">
            <h2>Profile</h2>
            <p>
              <strong>Name:</strong> {user?.name || 'Guest'}
            </p>
            <p>
              <strong>Email:</strong> {entitlement.email || user?.email || 'Not saved'}
            </p>
            <p>
              <strong>Plan:</strong> {entitlementStatusLabel(entitlement)} · Creator {planPriceLabel('creator', 'INR')}{' '}
              / Pro {planPriceLabel('pro', 'INR')} at checkout
            </p>
            <Link className="chip solid" to="/pricing">
              View pricing
            </Link>
          </article>

          <article className="tool-card">
            <h2>Referral link</h2>
            <p className="hint">Share Thumbric — attribution is stored locally and forwarded when the Worker is live.</p>
            <p className="account-ref-id">Your ref: {getOrCreateReferralId()}</p>
            <input className="account-ref-input" readOnly value={refLink} onFocus={(e) => e.target.select()} />
          </article>

          <article className="tool-card">
            <h2>Recent exports</h2>
            {history.length === 0 ? (
              <p className="hint">No downloads saved yet. Export from the editor to build local history.</p>
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
