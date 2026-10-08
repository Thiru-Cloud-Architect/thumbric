import { ToolShell } from './ToolShell'
import { PRODUCT_NAME_FULL } from './brand'

export default function LegalPage() {
  return (
    <ToolShell
      path="/legal"
      kicker="Legal"
      title={
        <>
          Privacy &amp; terms for <span className="gradient-text">{PRODUCT_NAME_FULL}</span>
        </>
      }
      lede="Short version: image processing for the editor and free tools happens in your browser. We do not sell personal data."
    >
      <article className="tool-card">
        <h2>Privacy</h2>
        <ul className="maker-tips">
          <li>Photos you drop into the editor, scorer, tester, or resizer stay on your device unless you download or share a score link you create.</li>
          <li>Header Sign in stores name + email in localStorage. If a Cloudflare Worker is connected, the same details can be appended to a JSON list in KV.</li>
          <li>Optional product analytics (tool used, generation, download, share) are stored on-device. If a Worker is connected they may be posted without extra profile fields.</li>
          <li>Referral IDs and first-touch UTM values live in localStorage so we can see which campaigns brought creators back.</li>
          <li>AI scene images: the free path calls a public image host from your browser. Premium quality uses a Worker proxy so the fal key never ships in the JavaScript bundle.</li>
        </ul>
      </article>
      <article className="tool-card">
        <h2>Terms</h2>
        <ul className="maker-tips">
          <li>The site is provided as-is. Thumbnail Score and A/B picks are heuristics, not YouTube analytics or CTR guarantees.</li>
          <li>You are responsible for photos, faces, and trademarks you upload or generate.</li>
          <li>Clean-export plans are currently demo unlocks in this browser until Stripe/Razorpay is connected.</li>
          <li>Do not abuse the free image path (automated scraping, bulk generation farms).</li>
        </ul>
      </article>
    </ToolShell>
  )
}
