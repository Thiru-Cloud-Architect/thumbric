import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME_FULL, UI_BUILD } from './brand'
import { DocumentHead } from './DocumentHead'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  activateDemoPlan,
  loadEntitlement,
  registerEmail,
  type Entitlement,
} from './entitlement'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import { PLANS, formatCompareAt, formatPlanPrice, type PlanId } from './plans'
import { useBillingCurrency } from './useBillingCurrency'
import './App.css'

export default function PricingPage() {
  const { currency, chooseCurrency } = useBillingCurrency()
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())

  function ensureEmail(current: Entitlement) {
    if (current.email) return current
    const email = window.prompt(
      'Enter your email to attach this plan (demo unlock on this browser — payments come later):',
    )
    if (!email) return null
    return registerEmail(email)
  }

  function onDemoSelect(planId: Exclude<PlanId, 'free'>) {
    let next = ensureEmail(entitlement)
    if (!next) return

    next = activateDemoPlan(next, planId)
    setEntitlement(next)
    window.alert(
      `${planId === 'pro' ? 'Pro' : 'Creator'} unlocked for 30 days in this browser (demo). Open the editor to export clean PNGs.`,
    )
  }

  return (
    <div className="page">
      <DocumentHead path="/pricing" />
      <SiteHeader />
      <main className="pricing-page-main">
        <section className="pricing-hero" aria-labelledby="pricing-page-title">
          <p className="section-eyebrow">Pricing</p>
          <h1 id="pricing-page-title" className="section-title center">
            Three simple tiers. <span className="gradient-text">Launch pricing.</span>
          </h1>
          <p className="section-lede center">
            Start free. Upgrade when you want downloads without the small corner mark.
          </p>
          <p className="pricing-launch-offer">Never again at these rates.</p>
          <div className="currency-toggle" role="group" aria-label="Billing currency">
            <button
              type="button"
              className={currency === 'USD' ? 'currency-btn is-active' : 'currency-btn'}
              aria-pressed={currency === 'USD'}
              onClick={() => chooseCurrency('USD')}
            >
              USD
            </button>
            <button
              type="button"
              className={currency === 'INR' ? 'currency-btn is-active' : 'currency-btn'}
              aria-pressed={currency === 'INR'}
              onClick={() => chooseCurrency('INR')}
            >
              INR
            </button>
          </div>
          <p className="pricing-region-note">
            {currency === 'INR' ? 'Prices are in rupees for India.' : 'Prices are in US dollars.'}
          </p>
        </section>

        <section className="pricing-section pricing-section-page" aria-label="Plans">
          <div className="pricing-grid pricing-grid-three">
            {PLANS.map((plan) => {
              const compare = formatCompareAt(plan, currency)
              const price = formatPlanPrice(plan, currency)
              const paid = plan.id !== 'free'
              return (
                <article
                  key={plan.id}
                  className={plan.popular ? 'price-card is-popular' : 'price-card'}
                >
                  {plan.popular ? <p className="price-popular-tag">Most popular</p> : null}
                  <h2>{plan.name}</h2>
                  <p className="price-tagline">{plan.tagline}</p>
                  <p className="price-amount">
                    {compare ? <span className="price-was">{compare}</span> : null}
                    <span>{price}</span>
                    {paid ? <small>/mo</small> : null}
                  </p>
                  {plan.highlight ? <p className="price-highlight">{plan.highlight}</p> : null}
                  <ul>
                    {plan.features.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {plan.id === 'free' ? (
                    <Link className="btn-outline price-cta" to="/ai-thumbnail-maker">
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={plan.popular ? 'btn-gradient price-cta' : 'btn-outline price-cta'}
                      onClick={() => onDemoSelect(plan.id as Exclude<PlanId, 'free'>)}
                    >
                      {plan.cta}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
          <p className="pricing-footnote">
            Creator includes {CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads per calendar month.
            Pro is unlimited. Struck-through amounts are regular rates; launch pricing ends when
            checkout goes live. Demo unlocks need no card.
          </p>
        </section>
      </main>
      <SiteFooter buildLabel={`${PRODUCT_NAME_FULL} · UI ${UI_BUILD}`} />
    </div>
  )
}
