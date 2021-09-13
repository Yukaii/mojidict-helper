import create from 'zustand/vanilla'

const store = create((set) => ({
  showCard: false,
  searchKeyword: null,
  selectionRect: null,

  setShowCard: (showCard) => set((state) => ({ ...state, showCard })),
  setSearchKeyword: (searchKeyword) =>
    set((state) => ({ ...state, searchKeyword })),
  setSelectionRect: (selectionRect) =>
    set((state) => ({ ...state, selectionRect })),
}))

export default store

export function searchFromSelection() {
  const selection = window.getSelection()
  const selectionText = selection.toString().trim()
  const range = selection.rangeCount > 0 && selection.getRangeAt(0)

  if (!selectionText.length || !range) {
    return
  }

  store.setState((state) => ({
    ...state,
    searchKeyword: selectionText,
    showCard: true,
  }))
}
