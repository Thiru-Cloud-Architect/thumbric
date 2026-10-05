import { useMemo, useState } from 'react'
import { FONT_CATEGORIES, FONTS, getFont, type FontId } from './fonts'

type Props = {
  value: FontId
  onChange: (id: FontId) => void
  sampleText: string
}

export function FontPicker({ value, onChange, sampleText }: Props) {
  const [query, setQuery] = useState('')
  const selected = getFont(value)
  const sample = sampleText.trim().slice(0, 36) || 'YOUR TITLE HERE'

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FONTS
    return FONTS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        FONT_CATEGORIES.find((g) => g.id === item.category)?.label.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="font-picker">
      <p
        className="font-preview"
        style={{ fontFamily: selected.css, fontWeight: selected.weight }}
      >
        {sample}
      </p>
      <label className="soft-field">
        Search fonts
        <input
          type="search"
          value={query}
          placeholder="Type Bebas, Pacifico, Inter…"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="photo-help">
        Selected: <strong>{selected.label}</strong> — tap a row to switch. Each row shows the real
        typeface (native dropdowns cannot do this).
      </p>
      <div className="font-picker-scroll" role="listbox" aria-label="Title fonts">
        {FONT_CATEGORIES.map((group) => {
          const items = filtered.filter((item) => item.category === group.id)
          if (!items.length) return null
          return (
            <div key={group.id} className="font-picker-group">
              <p className="font-group-label">{group.label}</p>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={item.id === value}
                  className={item.id === value ? 'font-option is-selected' : 'font-option'}
                  style={{ fontFamily: item.css, fontWeight: item.weight }}
                  onClick={() => onChange(item.id)}
                >
                  <span className="font-option-sample">{sample}</span>
                  <span className="font-option-name">{item.label}</span>
                </button>
              ))}
            </div>
          )
        })}
        {filtered.length === 0 ? (
          <p className="empty">No font match. Try “Bebas” or “Serif”.</p>
        ) : null}
      </div>
    </div>
  )
}
