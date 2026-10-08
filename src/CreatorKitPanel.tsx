import { FONTS, type FontId } from './fonts'
import { type CreatorKit, saveCreatorKit } from './creatorKit'

type CreatorKitPanelProps = {
  kit: CreatorKit
  onChange: (kit: CreatorKit) => void
  onApply: () => void
  onLogoFile: (file: File) => void
}

export function CreatorKitPanel({ kit, onChange, onApply, onLogoFile }: CreatorKitPanelProps) {
  function patch(partial: Partial<CreatorKit>) {
    const next = { ...kit, ...partial }
    onChange(next)
    saveCreatorKit(next)
  }

  return (
    <div className="creator-kit-panel">
      <p className="creator-kit-kicker">Creator kit</p>
      <p className="creator-kit-help">Saved in this browser — colors, font, and logo watermark.</p>
      <label className="inspector-field">
        Channel name (feed preview)
        <input
          type="text"
          value={kit.channelName}
          onChange={(event) => patch({ channelName: event.target.value })}
        />
      </label>
      <div className="inspector-row">
        <span className="inspector-label">Brand colors</span>
        <div className="creator-kit-swatches">
          <label>
            Primary
            <input type="color" value={kit.primary} onChange={(e) => patch({ primary: e.target.value })} />
          </label>
          <label>
            Accent
            <input type="color" value={kit.accent} onChange={(e) => patch({ accent: e.target.value })} />
          </label>
        </div>
      </div>
      <label className="inspector-field">
        Preferred title font
        <select value={kit.fontId} onChange={(event) => patch({ fontId: event.target.value as FontId })}>
          {FONTS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
      <div className="photo-actions">
        <label className="chip solid">
          Upload logo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onLogoFile(file)
            }}
          />
        </label>
        {kit.logoDataUrl ? (
          <button type="button" className="chip ghost" onClick={() => patch({ logoDataUrl: '' })}>
            Remove logo
          </button>
        ) : null}
      </div>
      <button type="button" className="chip solid" onClick={onApply}>
        Apply brand to canvas
      </button>
    </div>
  )
}
