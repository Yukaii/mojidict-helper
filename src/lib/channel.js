export default class Channel {
  constructor(port) {
    this.messageId = 0
    this.promises = {}

    this._setupListener(port)
  }

  send(type, payload) {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId
      this.promises[messageId] = { resolve, reject }

      this.port.postMessage({
        messageId,
        type,
        payload,
      })

      this.messageId += 1
    })
  }

  _setupListener(port) {
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
