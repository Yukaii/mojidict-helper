import React from 'react'
import ReactDOM from 'react-dom'
import ContentApp from './ContentApp'
import { QueryClient, QueryClientProvider } from 'react-query'

import { searchFromSelection } from '../../lib/store'

chrome.runtime.onMessage.addListener(function ({ type }, sender, sendResponse) {
  if (type === 'mojidict:searchSelection') {
    searchFromSelection()
  }
})

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
