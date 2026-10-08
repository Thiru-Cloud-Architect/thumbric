import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { MAKER_PAGES } from './toolsCatalog'
import { track } from './analytics'

export default function SeoMakerPage({ path }: { path: string }) {
  const page = MAKER_PAGES.find((item) => item.path === path) ?? MAKER_PAGES[0]!
  const isAiPage = page.path === '/ai-thumbnail-maker'
  const primaryTo = isAiPage
    ? '/ai-thumbnail-maker'
    : page.editorHash.startsWith('editor')
      ? { pathname: '/', hash: `#${page.editorHash === 'editor-ai' ? 'editor' : page.editorHash}` }
      : { pathname: '/', hash: '#editor' }

  return (
    <ToolShell
      path={page.path}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Tools', to: '/tools' },
        { label: page.h1 },
      ]}
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
          {isAiPage ? (
            <a
              className="btn-gradient"
              href="#ai-maker-hint"
              onClick={() => track('cta_click', { tool: page.path, cta: 'focus_prompt' })}
            >
              Describe or paste a URL
            </a>
          ) : (
            <Link
              className="btn-gradient"
              to={primaryTo}
              onClick={() => track('cta_click', { tool: page.path, cta: 'editor' })}
            >
              Open clean editor
            </Link>
          )}
          <Link
            className="btn-outline"
            to="/ai-thumbnail-maker"
            onClick={() => track('cta_click', { tool: page.path, cta: 'ai_maker' })}
          >
            AI Thumbnail Maker
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
