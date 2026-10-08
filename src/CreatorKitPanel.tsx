import { FONTS, type FontId } from './fonts'
import { LAYOUTS, type LayoutId } from './layout'
import {
  addFacePhoto,
  fileToDataUrl,
  removeFacePhoto,
  saveCreatorKit,
  type CreatorKit,
  type StylePreference,
} from './creatorKit'

type CreatorKitPanelProps = {
  kit: CreatorKit
  onChange: (kit: CreatorKit) => void
  onApply: () => void
  onLogoFile: (file: File) => void
  onCreateInMyStyle?: () => void
}

const STYLES: { id: StylePreference; label: string }[] = [
  { id: 'bold', label: 'Bold' },
  { id: 'clean', label: 'Clean' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'playful', label: 'Playful' },
]

export function CreatorKitPanel({
  kit,
  onChange,
  onApply,
  onLogoFile,
  onCreateInMyStyle,
}: CreatorKitPanelProps) {
  function patch(partial: Partial<CreatorKit>) {
    const next = { ...kit, ...partial }
    onChange(next)
    saveCreatorKit(next)
  }

  async function onFaceFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    const dataUrl = await fileToDataUrl(file)
    const next = addFacePhoto(kit, dataUrl)
    onChange(next)
    saveCreatorKit(next)
  }

  return (
    <div className="creator-kit-panel">
      <p className="creator-kit-kicker">Creator kit</p>
      <p className="creator-kit-help">
        Phase 3 personalization — faces, logo, colors, preferred layout & style. Saved in this browser.
      </p>
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
      <label className="inspector-field">
        Preferred layout
        <select
          value={kit.preferredLayout}
          onChange={(event) => patch({ preferredLayout: event.target.value as LayoutId })}
        >
          {LAYOUTS.map((layout) => (
            <option key={layout.id} value={layout.id}>
              {layout.label}
            </option>
          ))}
        </select>
      </label>
      <div className="inspector-row">
        <span className="inspector-label">Style preference</span>
        <div className="inspector-pills">
          {STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              className={kit.stylePreference === style.id ? 'inspector-pill is-selected' : 'inspector-pill'}
              onClick={() => patch({ stylePreference: style.id })}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      <label className="inspector-field">
        Typical expression
        <input
          type="text"
          value={kit.typicalExpression}
          onChange={(event) => patch({ typicalExpression: event.target.value })}
          placeholder="surprised / high energy"
        />
      </label>
      <div className="creator-kit-faces">
        <span className="inspector-label">Face / recurring photos ({kit.facePhotos.length}/10)</span>
        <div className="creator-kit-face-row">
          {kit.facePhotos.map((src, index) => (
            <button
              key={`${index}-${src.slice(-12)}`}
              type="button"
              className="creator-kit-face"
              title="Remove photo"
              onClick={() => {
                const next = removeFacePhoto(kit, index)
                onChange(next)
                saveCreatorKit(next)
              }}
            >
              <img src={src} alt="" />
            </button>
          ))}
          {kit.facePhotos.length < 10 ? (
            <label className="creator-kit-face is-add">
              +
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void onFaceFile(event.target.files?.[0])}
              />
            </label>
          ) : null}
        </div>
      </div>
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
      <div className="photo-actions">
        <button type="button" className="chip solid" onClick={onApply}>
          Apply brand to canvas
        </button>
        {onCreateInMyStyle ? (
          <button type="button" className="chip solid" onClick={onCreateInMyStyle}>
            Create next in my style
          </button>
        ) : null}
      </div>
    </div>
  )
}
