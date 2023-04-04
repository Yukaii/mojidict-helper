import { configureStore } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import mojiReducer from './features/moji/mojiSlice'
import { setSearchKeyword, setShowCard } from './features/moji/mojiSlice'

export const store = configureStore({
  reducer: {
    moji: mojiReducer,
  },
})

export function searchFromSelection() {
  const selection = window.getSelection()
  const selectionText = selection.toString().trim()
  const range = selection.rangeCount > 0 && selection.getRangeAt(0)
  if (!selectionText.length || !range) {
    return
  }
  store.dispatch(setSearchKeyword(selectionText))
  store.dispatch(setShowCard(true))
}

const getStorageState = (rawState) => {
  try {
    return JSON.parse(rawState).state
  } catch {
    return {}
  }
}

const STORAGE_KEY = 'mojidict-app-storage'

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'sync') {
    if (changes[STORAGE_KEY]) {
      const newState = getStorageState(changes[STORAGE_KEY].newValue)
      // get moji store state from redux store by using useSelector
      const mojiState = useSelector((state) => state.moji)
      console.log('mojiState', mojiState)
      if (JSON.stringify(newState) !== JSON.stringify(mojiState)) {
        // sync to redux store
        console.log('newState', newState)
      }
    }
  }
})


export default store;