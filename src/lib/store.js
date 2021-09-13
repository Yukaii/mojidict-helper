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
