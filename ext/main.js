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
const fetchWord = wordId => channel.send( 'fetchWord', { wordId })
// #endregion

document.ondblclick = function () {
  const selection = window.getSelection()
  const selectionText = selection.toString()

  search(selectionText).then(res => console.log(res))
}



