// #region MojiDict API proxied with background script
class Channel {
  constructor (port) {
    this.messageId = 0
    this.promises = {}

    this._setupListener(port)
  }

  send (type, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId
      this.promises[messageId] = { resolve, reject }

      this.port.postMessage({
        messageId,
        type,
        payload
      })

      this.messageId += 1
    })
  }

  _setupListener (port) {
    this.port = chrome.runtime.connect({ name: port })
    this.port.onMessage.addListener(({ messageId, result, error }) => {
      const promise = this.promises[messageId]

      if (promise) {
        const { resolve, reject } = promise

        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    })
  }
}

const channel = new Channel('mojidict-api')

const search = searchText => channel.send('search', { searchText })
const fetchWord = wordId => channel.send('fetchWord', { wordId })
// #endregion

function getWordCardContainer () {
  return document.querySelector('.mojidict-helper-card-container')
}

function setupWordCardContainer () {
  if (!getWordCardContainer()) {
    const div = document.createElement('div')
    div.className = 'mojidict-helper-card-container'

    document.body.appendChild(div)
  }
}

setupWordCardContainer()

let cardId = 0
function showWordCard (selectionText, rect) {
  const container = getWordCardContainer()

  const cardDiv = document.createElement('div')

  cardDiv.className = 'mojidict-helper-card'
  cardDiv.innerHTML = `
    <div class="close-button"></div>

    <div class="loading-container">
      <div class="word-detail-container">
        <div class="word-title" title="${selectionText}">${selectionText}</div>
      </div>

      <div class="loading-placeholder"></div>
    </div>
  `
  // div.innerHTML = await buildCardInner(wordId)
  cardDiv.style.cssText = `
    transform: translate(${rect.left + window.pageXOffset}px, ${rect.top + rect.height + window.pageYOffset}px);
  `
  cardDiv.setAttribute('card-id', cardId++)

  container.innerHTML = ''
  container.appendChild(cardDiv)

  registerCardEvent(cardDiv)

  return cardDiv
}

async function updateWordCard (card, wordId, selectionText) {
  if (!card) {
    return
  }

  const html = await buildCardInner(wordId, selectionText)

  const container = card.querySelector('.loading-container')
  if (!container) {
    return
  }

  container.outerHTML = html
}

async function buildCardInner (wordId, selectionText) {
  const { result: { word, details, subdetails } } = await fetchWord(wordId)

  const renderDetails = (details, subdetails) => details.map(detail => {
    const subDetails = subdetails.filter(sub => sub.detailsId === detail.objectId)

    return `<span class="detail-title" title="${detail.title}">${detail.title}</span>

      ${subDetails.map((subdetail, index) => `<p title="${subdetail.title}">${index + 1}. ${subdetail.title}</p>`).join('')}
      `
  }).join('')

  return `
    <div class="word-detail-container">
      <div class="word-title" title="${selectionText}">${selectionText}</div>
      <div class="word-spell">${word.spell} | ${word.pron} ${word.accent}</div>

      <div class="word-detail">
        ${renderDetails(details, subdetails)}
      </div>
    </div>

    <div class="button-group">
      <a class="moji-button" href="${`https://www.mojidict.com/zh-hant/details/${wordId}`}" target="_blank">詳情</a>
      <a class="moji-button" href="${`https://www.mojidict.com/zh-hant/searchText/${encodeURIComponent(word.spell)}`}" target="_blank">更多</a>
    </div>
  `
}

function registerCardEvent (card) {
  const dismiss = function (event) {
    if (!card.contains(event.target)) {
      card.remove()
      document.removeEventListener('click', dismiss)
    }
  }

  card.querySelector('.close-button').addEventListener('click', function () {
    card.remove()
  })

  document.addEventListener('click', dismiss)
}

async function searchFromSelection () {
  const selection = window.getSelection()
  const selectionText = selection.toString()

  const card = showWordCard(selectionText, selection.getRangeAt(0).getBoundingClientRect())

  const res = await search(selectionText)

  if (res.result && res.result.searchResults.length > 0) {
    if (res.result.searchResults.filter(r => r.type === 0).length > 0) {
      const wordId = res.result.searchResults[0].tarId
      updateWordCard(card, wordId, selectionText)
    } else {
      // TODO: render web search results
    }
  }
}

document.addEventListener('dblclick', async () => {
  searchFromSelection()
})

chrome.runtime.onMessage.addListener(function ({ type }, sender, sendResponse) {
  if (type === 'mojidict:searchSelection') {
    searchFromSelection()
  }
})
