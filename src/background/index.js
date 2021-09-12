const cachedFn = (fn) => {
  const cachedResults = {}
  const getCacheKey = (args) => args.map(arg => JSON.stringify(arg)).join('-')

  return async (...args) => {
    const cacheKey = getCacheKey(args)
    if (cachedResults[cacheKey]) {
      return cachedResults[cacheKey]
    } else {
      const result = await fn.call(fn, ...args)
      cachedResults[cacheKey] = result
      return result
    }
  }
}

// #region MojiDict API
const basePayload = {
  '_ApplicationId': 'E62VyFVLMiW7kvbtVq3p',
  '_ClientVersion': 'js2.10.0'
}
const API_ENDPOINT = 'https://api.mojidict.com/parse/functions'

const request = (method, body) => fetch(`${API_ENDPOINT}/${method}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  mode: 'no-cors',
  body: JSON.stringify({
    ...basePayload,
    ...body
  })
}).then(r => r.json())

const search = cachedFn(searchText => request('search_v3', {
  searchText,
  needWords: true,
  langEnv: 'zh-CN_ja'
}))

const fetchWord = cachedFn(wordId => request('fetchWord_v2', { wordId }))
// #endregion

chrome.runtime.onConnect.addListener(function (port) {
  if (!port.name === 'mojidict-api') {
    return
  }

  port.onMessage.addListener(function ({ messageId, type, payload }) {
    if (type === 'search') {
      search(payload.searchText).then(result => {
        port.postMessage({ messageId, result })
      }).catch(error => {
        port.postMessage({ messageId, result: error, error: true })
      })
    } else if (type === 'fetchWord') {
      fetchWord(payload.wordId).then(result => {
        port.postMessage({ messageId, result })
      }).catch(error => {
        port.postMessage({ messageId, result: error, error: true })
      })
    }
  })
})

chrome.contextMenus.create({
  id: 'mojidict:searchSelection',
  title: 'Search "%s" with MojiDict',
  contexts: ['selection']
})

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.sendMessage(tab.id, { type: 'mojidict:searchSelection' })
})  