import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { MAKER_PAGES } from './toolsCatalog'
import { saveAiHandoff } from './aiHandoff'
import { track } from './analytics'

export default function SeoMakerPage({ path }: { path: string }) {
  const page = MAKER_PAGES.find((item) => item.path === path) ?? MAKER_PAGES[0]!
  const hash = page.editorHash

  return (
    <ToolShell
      path={page.path}
      kicker={page.kicker}
      title={
        <>
          {page.h1} <span className="gradient-text">{page.h1Accent}</span>
        </>
      }
      lede={page.lede}
    >
      <section className="tool-card">
        <ol className="maker-steps">
          {page.steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="tool-actions">
          <Link
            className="btn-gradient"
            to={{ pathname: '/', hash: `#${hash}` }}
            onClick={() => {
              saveAiHandoff({
                hint:
                  page.nicheHint === 'gaming'
                    ? 'intense gamer silhouette in RGB neon room, controller in hand, cinematic fog'
                    : page.nicheHint === 'faceless'
                      ? 'premium object hero on dark marble, dramatic rim light, empty space for a title'
                      : page.nicheHint === 'shorts'
                        ? 'vertical close-up subject, high contrast, empty lower third for a title'
                        : page.nicheHint === 'podcast'
                          ? 'two hosts in a warm studio, big faces, shallow depth of field'
                          : 'expressive creator looking at camera, dramatic key light, empty space for a title',
                source: page.path,
              })
              track('cta_click', { tool: page.path, cta: 'editor' })
            }}
          >
            Try AI Thumbnail creator
          </Link>
          <Link className="btn-outline" to="/youtube-thumbnail-score">
            Score an existing thumb
          </Link>
        </div>
      </section>
      <section className="tool-card">
        <h2>What actually helps the click</h2>
        <ul className="maker-tips">
          {page.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
        <p className="hint">
          Thumbric does not promise a CTR lift. It gives you faster, sharper stills and a canvas sized for the platform.
        </p>
      </section>
    </ToolShell>
  )
}
