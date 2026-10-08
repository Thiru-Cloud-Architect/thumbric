import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'
import { MAKER_NAV, TOOL_NAV } from './toolsCatalog'
import { track } from './analytics'

export default function ToolsHubPage() {
  return (
    <ToolShell
      path="/tools"
      kicker="Free tools"
      title={
        <>
          Free YouTube thumbnail tools. <span className="gradient-text">Try before signup.</span>
        </>
      }
      lede="Score, test, resize, calculate CTR, and analyze titles in the browser. Then generate 3 AI looks when you are ready."
    >
      <section className="tools-hub-grid" aria-label="Free tools">
        {TOOL_NAV.map((item) => (
          <Link
            key={item.id}
            className="tool-hub-card"
            to={item.path}
            onClick={() => track('tool_started', { tool: item.id })}
          >
            <h3>{item.label}</h3>
            <p>{item.blurb}</p>
            <span className="tool-hub-card-link">Open →</span>
          </Link>
        ))}
      </section>
      <p className="tools-hub-subhead">Makers by niche</p>
      <section className="tools-hub-grid" aria-label="Makers">
        {MAKER_NAV.map((item) => (
          <Link key={item.id} className="tool-hub-card" to={item.path}>
            <h3>{item.label}</h3>
            <p>{item.blurb}</p>
            <span className="tool-hub-card-link">Open →</span>
          </Link>
        ))}
      </section>
    </ToolShell>
  )
}
