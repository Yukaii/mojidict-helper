// #region MojiDict API proxied with background script
class Channel {
  constructor(port) {
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

async function showWordCard (wordId, rect) {
  const container = getWordCardContainer()

  const div = document.createElement('div')

  div.className = 'mojidict-helper-card'
  div.innerHTML = await buildCardInner(wordId)
  div.style.cssText = `
    top: ${rect.top + rect.height}px;
    left: ${rect.left}px;
  `

  container.innerHTML = ''
  container.appendChild(div)

  registerCardEvent(div)
}

async function buildCardInner (wordId) {
  const { result: { word, details, subdetails } } = await fetchWord(wordId)

  const renderDetails = (details, subdetails) => details.map(detail => {
    const subDetails = subdetails.filter(sub => sub.detailsId === detail.objectId)

    return `<span class="detail-title" title="${detail.title}">${detail.title}</span>

      ${subDetails.map((subdetail, index) => `<p title="${subdetail.title}">${index + 1}. ${subdetail.title}</p>`).join('')}
      `
  }).join('')

  return `
    <h3 title="${word.spell}">${word.spell}</h3>
    <h4>${word.spell} | ${word.pron} ${word.accent}</h4>

    <div class="detail">
      ${renderDetails(details, subdetails)}
    </div>

    <div class="btns">
      <a class="btn" href="${`https://www.mojidict.com/zh-hant/details/${wordId}`}" target="_blank">詳情</a>
      <a class="btn" href="${`https://www.mojidict.com/zh-hant/searchText/${encodeURIComponent(word.spell)}`}" target="_blank">更多</a>
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
  const onScroll = function () {
    card.remove()
    document.removeEventListener('scroll', onScroll)
  }

  document.addEventListener('click', dismiss)
  document.addEventListener('scroll', onScroll)
}


document.addEventListener('dblclick', async () => {
  const selection = window.getSelection()
  const selectionText = selection.toString()

  const res = await search(selectionText)

  if (res.result && res.result.searchResults.length > 0) {
    if (res.result.searchResults.filter(r => r.type === 0).length > 0) {
      showWordCard(res.result.searchResults[0].tarId, selection.getRangeAt(0).getBoundingClientRect())
    } else {
      // TODO: render web search results
    }
  }
})
