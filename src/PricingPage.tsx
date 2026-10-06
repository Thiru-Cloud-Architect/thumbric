import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_NAME, UI_BUILD } from './brand'
import {
  CREATOR_CLEAN_DOWNLOADS_PER_MONTH,
  activateDemoPlan,
  loadEntitlement,
  registerEmail,
  type Entitlement,
} from './entitlement'
import { SiteFooter } from './LandingSections'
import { SiteHeader } from './SiteHeader'
import {
  PLANS,
  formatCompareAt,
  formatPlanPrice,
  type BillingCurrency,
  type PlanId,
} from './plans'
import './App.css'

export default function PricingPage() {
  const [currency, setCurrency] = useState<BillingCurrency>('USD')
  const [entitlement, setEntitlement] = useState<Entitlement>(() => loadEntitlement())

  function onDemoSelect(planId: Exclude<PlanId, 'free'>) {
    let next = entitlement
    if (!next.email) {
      const email = window.prompt('Enter your email to attach this plan (demo unlock on this browser):')
      if (!email) return
      next = registerEmail(email)
    }
    next = activateDemoPlan(next, planId)
    setEntitlement(next)
    window.alert(
      `${planId === 'pro' ? 'Pro' : 'Creator'} unlocked for 30 days in this browser. Open the editor to export clean PNGs.`,
    )
  }

  return (
    <div className="page">
      <SiteHeader />
      <main className="pricing-page-main">
        <section className="pricing-hero" aria-labelledby="pricing-page-title">
          <p className="section-eyebrow">Pricing</p>
          <h1 id="pricing-page-title" className="section-title center">
            Simple plans for <span className="gradient-text">every upload cadence</span>
          </h1>
          <p className="section-lede center">
            Unlimited watermarked previews stay free. Upgrade when you need clean PNGs without the on-photo
            mark.
          </p>
          <div className="currency-toggle" role="group" aria-label="Billing currency">
            <button
              type="button"
              className={currency === 'USD' ? 'currency-btn is-active' : 'currency-btn'}
              aria-pressed={currency === 'USD'}
              onClick={() => setCurrency('USD')}
            >
              USD
            </button>
            <button
              type="button"
              className={currency === 'INR' ? 'currency-btn is-active' : 'currency-btn'}
              aria-pressed={currency === 'INR'}
              onClick={() => setCurrency('INR')}
            >
              INR
            </button>
          </div>
          {currency === 'INR' ? (
            <p className="pricing-region-note">
              India pricing — lower local rates in rupees. Billed monthly when checkout goes live.
            </p>
          ) : (
            <p className="pricing-region-note">Prices shown in US dollars by default.</p>
          )}
        </section>

        <section className="pricing-section pricing-section-page" aria-label="Plans">
          <div className="pricing-grid">
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
                    <Link className="btn-outline price-cta" to="/#editor">
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={plan.popular ? 'btn-gradient price-cta' : 'btn-outline price-cta'}
                      onClick={() => onDemoSelect(plan.id as 'creator' | 'pro')}
                    >
                      {plan.cta}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
          <p className="pricing-footnote">
            Creator includes {CREATOR_CLEAN_DOWNLOADS_PER_MONTH} clean downloads per calendar month. Pro is
            unlimited. Stripe checkout connects next — demo unlock stores your plan in this browser for 30
            days.
          </p>
        </section>
      </main>
      <SiteFooter />
      <p className="build-tag build-tag-fixed">
        {PRODUCT_NAME} · UI {UI_BUILD}
      </p>
    </div>
  )
}
