import React from 'react'
import { createRoot } from "react-dom/client";
import ContentApp from './ContentApp'
import { QueryClient, QueryClientProvider } from 'react-query'

import { searchFromSelection } from '../../lib/store'

import store from '../../lib/store'
import { Provider as ReduxProvider } from 'react-redux'

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
	const root = createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <ContentApp />
        </QueryClientProvider>
      </ReduxProvider>
    </React.StrictMode>,
    appContainer
  )
}

setupReactApp()
