import React from 'react'
import ReactDOM from 'react-dom'
import ContentApp from './ContentApp'
import { QueryClient, QueryClientProvider } from 'react-query'

import store from '../../lib/store'

document.addEventListener('dblclick', async () => {
  searchFromSelection()
})

chrome.runtime.onMessage.addListener(function ({ type }, sender, sendResponse) {
  if (type === 'mojidict:searchSelection') {
    searchFromSelection()
  }
})

function searchFromSelection() {
  const selection = window.getSelection()
  const selectionText = selection?.toString().trim()
  const range = selection?.getRangeAt(0)

  if (!selectionText.length || !range) {
    return
  }

  store.setState((state) => ({
    ...state,
    searchKeyword: selectionText,
    selectionRect: range.getBoundingClientRect(),
    showCard: true,
  }))
}

function getWordCardContainer() {
  return document.querySelector('.mojidict-helper-card-container')
}

function findOrCreateWordCardContainer() {
  const appContainer = getWordCardContainer()
  if (appContainer) {
    return appContainer
  } else {
    const div = document.createElement('div')
    div.className = 'mojidict-helper-card-container'

    document.body.appendChild(div)

    return div
  }
}

const queryClient = new QueryClient()

function setupReactApp() {
  const appContainer = findOrCreateWordCardContainer()

  ReactDOM.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ContentApp />
      </QueryClientProvider>
    </React.StrictMode>,
    appContainer
  )
}

setupReactApp()
