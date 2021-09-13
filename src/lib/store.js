import create from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

const storage = {
  getItem: async (name) => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([name], function (result) {
        resolve(result.key)
      })
    })
  },
  setItem: async (name, value) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [name]: value }, function () {
        resolve()
      })
    })
  },
}

const store = create(
  persist(
    (set) => ({
      showCard: false,
      searchKeyword: null,
      selectionRect: null,

      setShowCard: (showCard) => set((state) => ({ ...state, showCard })),
      setSearchKeyword: (searchKeyword) =>
        set((state) => ({ ...state, searchKeyword })),
      setSelectionRect: (selectionRect) =>
        set((state) => ({ ...state, selectionRect })),
    }),
    {
      name: 'mojidict-app-storage',
      getStorage: () => storage,
    }
  )
)

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
