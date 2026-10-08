export type EditorLayerId = 'background' | 'photo' | 'title' | 'stickers' | 'logo'

export type LayerState = {
  visibility: Record<EditorLayerId, boolean>
  locked: Record<EditorLayerId, boolean>
}

export const LAYER_LABELS: Record<EditorLayerId, string> = {
  background: 'Background',
  photo: 'Photo / AI still',
  title: 'Title',
  stickers: 'Stickers',
  logo: 'Brand logo',
}

export function defaultLayerState(): LayerState {
  return {
    visibility: {
      background: true,
      photo: true,
      title: true,
      stickers: true,
      logo: true,
    },
    locked: {
      background: false,
      photo: false,
      title: false,
      stickers: false,
      logo: false,
    },
  }
}

export function isLayerVisible(state: LayerState, id: EditorLayerId) {
  return state.visibility[id] !== false
}

export function isLayerLocked(state: LayerState, id: EditorLayerId) {
  return state.locked[id] === true
}
