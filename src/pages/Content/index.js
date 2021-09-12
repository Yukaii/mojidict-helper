import Channel from '../../lib/channel'
import React from 'react'
import ReactDOM from 'react-dom'
import ContentApp from './ContentApp'

const channel = new Channel('mojidict-api')

const search = (searchText) => channel.send('search', { searchText })
const fetchWord = (wordId) => channel.send('fetchWord', { wordId })

/*
document.addEventListener('dblclick', async () => {
  searchFromSelection()
})

chrome.runtime.onMessage.addListener(function ({ type }, sender, sendResponse) {
  if (type === 'mojidict:searchSelection') {
    searchFromSelection()
  }
})
*/

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

function setupReactApp() {
  const appContainer = findOrCreateWordCardContainer()

  ReactDOM.render(
    <React.StrictMode>
      <ContentApp />
    </React.StrictMode>,
    appContainer
  )
}

setupReactApp()
