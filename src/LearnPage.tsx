import { Link } from 'react-router-dom'
import { ToolShell } from './ToolShell'

const LESSONS = [
  {
    id: 'mobile',
    title: 'If it fails at 160px, it fails on YouTube',
    body: 'Most people meet your thumbnail as a tiny tile. Zoom your draft out until it is the size of a postage stamp. If you cannot tell the subject and the 3-word hook, crop tighter, raise contrast, and drop extra badges. The editor’s live canvas is 1280×720 — mentally shrink it before you export.',
  },
  {
    id: 'text',
    title: 'How much text a thumbnail should have',
    body: 'Three to five punchy words usually beat a sentence. The title already lives under the video; the thumbnail should punch one idea (emotion, stakes, or object). If you need more than one line, put the second line in the Title kit, keep outline thick, and leave the busy part of the photo uncovered. Adding more text often makes mobile readability worse, not better.',
  },
  {
    id: 'faces',
    title: 'Why big faces work',
    body: 'A readable face is a shortcut for emotion. Crop so eyes are large, on the left or center, with a catchlight. Faceless channels can still steal the same trick: make the object as “face-like” as possible — one product, one map, one animal, oversized. Collages and tiny heads are the usual amateur tell.',
  },
]

export default function LearnPage() {
  return (
    <ToolShell
      path="/learn"
      kicker="Lessons"
      title={
        <>
          Thumbnail lessons that <span className="gradient-text">help the click.</span>
        </>
      }
      lede="Short, original notes — not a dump of keyword pages. Use them, then score your own thumbnail."
    >
      {LESSONS.map((lesson) => (
        <article key={lesson.id} id={lesson.id} className="tool-card">
          <h2>{lesson.title}</h2>
          <p>{lesson.body}</p>
        </article>
      ))}
      <p className="hint">
        Next: <Link to="/youtube-thumbnail-score">score a thumbnail</Link> or{' '}
        <Link to={{ pathname: '/', hash: '#editor-ai' }}>generate 3 looks</Link>.
      </p>
    </ToolShell>
  )
}
