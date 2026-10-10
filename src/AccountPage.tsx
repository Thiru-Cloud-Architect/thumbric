import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { referralUrl, getOrCreateReferralId } from './analytics'
import { PRODUCT_NAME_FULL, SITE_URL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { AuthModal } from './AuthModal'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  CREATOR_PRO_IMAGES_PER_MONTH,
  FREE_PRO_IMAGES_PER_MONTH,
  cleanDownloadsLeft,
  isPaid,
  loadEntitlement,
  planDisplayName,
  proImageLimit,
  proImagesLeft,
  type Entitlement,
} from './entitlement'
import { planPriceLabel } from './plans'
import { useBillingCurrency } from './useBillingCurrency'
import { useAuth } from './auth'
import { FREE_DAILY_DOWNLOADS, loadDailyDownloads } from './usageLimits'
import { loadThumbnailHistory } from './thumbnailHistory'
import { loadSimpleUser } from './simpleAuth'
import { useHeaderAuth } from './useHeaderAuth'
import './App.css'

function quotaLabel(left: number, limit: number) {
  if (!Number.isFinite(limit)) return 'Unlimited'
  return `${Math.max(0, left)} / ${limit}`
}

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const header = useHeaderAuth()
  const { currency } = useBillingCurrency()
  const [searchParams, setSearchParams] = useSearchParams()
  const [authOpen, setAuthOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())
  const history = loadThumbnailHistory()
  const simple = loadSimpleUser()
  const refLink = referralUrl(SITE_URL)
  const name = user?.name || simple?.name || entitlement.email?.split('@')[0] || 'Guest'
  const email = user?.email || simple?.email || entitlement.email || ''
  const initial = name.trim().charAt(0).toUpperCase() || 'T'
  const usedToday = loadDailyDownloads().count
  const watermarkLeft = email
    ? Math.max(0, FREE_DAILY_DOWNLOADS - usedToday)
    : 0
  const planName = planDisplayName(entitlement)
  const paid = isPaid(entitlement)
  const cleanLeft = cleanDownloadsLeft(entitlement)
  const proLeft = proImagesLeft(entitlement)
  const proLimit = proImageLimit(entitlement)
  const paidUntilLabel =
    entitlement.paidUntil && paid
      ? new Date(entitlement.paidUntil).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null

  useEffect(() => {
    setEntitlement(loadEntitlement())
  }, [user?.email])

  useEffect(() => {
    if (searchParams.get('signin') === '1' && !user && !simple) {
      setAuthOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('signin')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, user, simple])

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
      <SiteHeader
        userLabel={header.userLabel}
        planLabel={header.signedIn ? header.planLabel : null}
        onLoginClick={header.onLoginClick}
      />
      <AuthModal
        open={authOpen}
        reason="generic"
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setEntitlement(loadEntitlement())
          setAuthOpen(false)
        }}
      />
      <main className="account-home">
        <header className="account-hero">
          <div className="account-avatar" aria-hidden>
            {initial}
          </div>
          <div className="account-identity">
            <p className="account-kicker">Account</p>
            <h1>{name}</h1>
            <p>{email || 'Not signed in — register free to save work'}</p>
          </div>
          <div className="account-hero-side">
            <span className="account-plan" data-plan={entitlement.plan}>
              {planName}
            </span>
            {email ? (
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
            <strong>{planName}</strong>
            <span>
              {paidUntilLabel
                ? `${entitlement.trial ? 'Trial' : 'Plan'} through ${paidUntilLabel}`
                : 'Current plan on this device'}
            </span>
            {!paid ? (
              <Link to="/pricing">Upgrade to Creator {planPriceLabel('creator', currency)}</Link>
            ) : (
              <Link to="/pricing">Compare plans</Link>
            )}
          </article>
          <article>
            <strong>
              {paid
                ? entitlement.plan === 'pro'
                  ? 'Unlimited'
                  : quotaLabel(cleanLeft, CREATOR_CLEAN_DOWNLOADS_PER_MONTH)
                : quotaLabel(watermarkLeft, FREE_DAILY_DOWNLOADS)}
            </strong>
            <span>
              {paid
                ? entitlement.plan === 'pro'
                  ? 'clean PNG exports'
                  : 'clean PNGs left this month'
                : 'watermarked downloads left today'}
            </span>
          </article>
          <article>
            <strong>{quotaLabel(proLeft, Number.isFinite(proLimit) ? proLimit : Infinity)}</strong>
            <span>
              Pro AI images left
              {!Number.isFinite(proLimit)
                ? ' (unlimited)'
                : paid && entitlement.plan === 'creator'
                  ? ` of ${CREATOR_PRO_IMAGES_PER_MONTH}/mo`
                  : ` of ${FREE_PRO_IMAGES_PER_MONTH}/mo free`}
            </span>
            <Link to="/ai-thumbnail-maker">Open AI Maker</Link>
          </article>
        </section>

        <section className="account-work">
          <div className="account-panel">
            <div className="account-panel-head">
              <h2>Recent thumbnails</h2>
              <Link to="/#editor">Create</Link>
            </div>
            {history.length === 0 ? (
              <p className="account-empty">
                Nothing saved yet. Make one in the editor and it will show up here.
              </p>
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
            <p className="account-empty" style={{ marginTop: '0.75rem' }}>
              Tip: Creator unlock and Pro AI quota are stored in this browser until Stripe is
              connected. Use the same email when you sign in.
            </p>
          </aside>
        </section>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · build ${UI_BUILD}`} />
    </div>
  )
}
