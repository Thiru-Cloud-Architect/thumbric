import {
  LAYER_LABELS,
  type EditorLayerId,
  type LayerState,
  defaultLayerState,
} from './editorLayers'

type LayersPanelProps = {
  state: LayerState
  onChange: (next: LayerState) => void
  stickerCount: number
  hasLogo: boolean
}

const ORDER: EditorLayerId[] = ['background', 'photo', 'title', 'stickers', 'logo']

export function LayersPanel({ state, onChange, stickerCount, hasLogo }: LayersPanelProps) {
  function toggleVisibility(id: EditorLayerId) {
    onChange({
      ...state,
      visibility: { ...state.visibility, [id]: !state.visibility[id] },
    })
  }

  function toggleLock(id: EditorLayerId) {
    onChange({
      ...state,
      locked: { ...state.locked, [id]: !state.locked[id] },
    })
  }

  function resetLayers() {
    onChange(defaultLayerState())
  }

  return (
    <div className="layers-panel">
      <div className="layers-panel-head">
        <p className="layers-panel-kicker">Layers</p>
        <button type="button" className="chip ghost layers-reset" onClick={resetLayers}>
          Reset
        </button>
      </div>
      <ul className="layers-list">
        {ORDER.map((id) => {
          const hidden = id === 'logo' && !hasLogo
          const meta =
            id === 'stickers' && stickerCount > 0 ? `${stickerCount} on canvas` : id === 'logo' && !hasLogo ? 'Add in Brand kit' : ''
          return (
            <li key={id} className={hidden ? 'layers-row is-muted' : 'layers-row'}>
              <button
                type="button"
                className={state.visibility[id] ? 'layers-eye is-on' : 'layers-eye'}
                aria-label={state.visibility[id] ? `Hide ${LAYER_LABELS[id]}` : `Show ${LAYER_LABELS[id]}`}
                onClick={() => toggleVisibility(id)}
                disabled={hidden && id === 'logo'}
              >
                {state.visibility[id] ? '◉' : '○'}
              </button>
              <span className="layers-label">
                {LAYER_LABELS[id]}
                {meta ? <small>{meta}</small> : null}
              </span>
              <button
                type="button"
                className={state.locked[id] ? 'layers-lock is-on' : 'layers-lock'}
                aria-label={state.locked[id] ? `Unlock ${LAYER_LABELS[id]}` : `Lock ${LAYER_LABELS[id]}`}
                onClick={() => toggleLock(id)}
              >
                {state.locked[id] ? '🔒' : '🔓'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
