type ShortcutsModalProps = {
  open: boolean
  onClose: () => void
}

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'V', action: 'Select / focus canvas' },
  { keys: 'T', action: 'Focus title inspector' },
  { keys: 'I', action: 'Upload image' },
  { keys: 'Delete / Backspace', action: 'Remove selected sticker' },
  { keys: 'Esc', action: 'Deselect' },
  { keys: '⌘/Ctrl + Z', action: 'Undo' },
  { keys: '⌘/Ctrl + Shift + Z / Y', action: 'Redo' },
  { keys: '⌘/Ctrl + D', action: 'Duplicate selected sticker' },
  { keys: '⌘/Ctrl + S', action: 'Force autosave' },
  { keys: '← ↑ → ↓', action: 'Nudge title or sticker 1%' },
  { keys: 'Shift + arrows', action: 'Nudge 5%' },
  { keys: '+ / −', action: 'Zoom in / out' },
  { keys: '0', action: 'Fit / 100% zoom' },
  { keys: '?', action: 'Open this shortcuts help' },
]

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="shortcuts-title">Keyboard shortcuts</h2>
        <p className="hint">Works when you are not typing in an input.</p>
        <ul className="shortcuts-list">
          {SHORTCUTS.map((item) => (
            <li key={item.keys}>
              <kbd>{item.keys}</kbd>
              <span>{item.action}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="chip solid" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
