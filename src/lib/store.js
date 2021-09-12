import create from 'zustand/vanilla'

const store = create(() => ({
  showCard: false,
  searchKeyword: null,
  selectionRect: null,
}))

export default store
