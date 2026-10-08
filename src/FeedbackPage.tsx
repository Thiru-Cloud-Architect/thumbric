import { useState, type FormEvent } from 'react'
import { track } from './analytics'
import { ToolShell } from './ToolShell'

type FeedbackKind = 'bug' | 'feature'

export default function FeedbackPage() {
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!message.trim()) return
    track(kind === 'bug' ? 'bug_report_submitted' : 'feature_request_submitted', {
      kind,
      length: message.length,
    })
    setSent(true)
  }

  return (
    <ToolShell
      path="/feedback"
      kicker="Feedback"
      title={
        <>
          Bug reports &amp; <span className="gradient-text">feature ideas</span>
        </>
      }
      lede="Tell us what broke or what would make Thumbric a daily driver. Reports stay in local analytics until email relay is wired."
    >
      {sent ? (
        <article className="tool-card">
          <h2>Thanks — logged on this device</h2>
          <p>
            We stored your {kind === 'bug' ? 'bug report' : 'feature request'} in product analytics. Optional: email{' '}
            <a href="mailto:hello@thumbric.app?subject=Thumbric%20feedback">hello@thumbric.app</a> with a screenshot.
          </p>
        </article>
      ) : (
        <form className="tool-card feedback-form" onSubmit={onSubmit}>
          <div className="choice-row">
            <button
              type="button"
              className={kind === 'bug' ? 'choice is-selected' : 'choice'}
              onClick={() => setKind('bug')}
            >
              Bug report
            </button>
            <button
              type="button"
              className={kind === 'feature' ? 'choice is-selected' : 'choice'}
              onClick={() => setKind('feature')}
            >
              Feature request
            </button>
          </div>
          <label className="inspector-field">
            Email (optional)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@channel.com" />
          </label>
          <label className="inspector-field">
            Details
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                kind === 'bug'
                  ? 'What happened? Which browser? Steps to reproduce…'
                  : 'What should Thumbric do better for your upload workflow?'
              }
              required
            />
          </label>
          <button type="submit" className="chip solid">
            Submit feedback
          </button>
        </form>
      )}
    </ToolShell>
  )
}
