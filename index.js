const noop = () => {}
const Client = require('cabal-client')
const events = require('events')

class Bot extends events.EventEmitter {
  constructor ({config, onmention, nickname}) {
    super()
    this.client = new Client({
      config
    })
    this.nickname = nickname
  }

  join (_keys, cb) {
    let keys = Array.from(new Set(_keys)) // remove duplicates
    var pendingCabals = keys.map(this.client.addCabal.bind(this.client))
    Promise.all(pendingCabals).then(() => {
      if (this.nickname) {
        console.log('nick published', this.nickname)
        keys = this.client.getCabalKeys()
        keys.map((key) => {
          var cabal = this.client._getCabalByKey(key)
          cabal.publishNick(this.nickname, noop)
          var details = this.client.getDetails(cabal)
          details.on('new-message', ({ channel, author, message }) => {
            if (message.value.content.text.startsWith(this.nickname)) {
              return this.emit('mention', { key, channel, author, message })
            }
          })
        })
      }
      cb()
    }).catch(cb)
  }

  say (key, channel, message, cb) {
    var details = this.client.getDetails(key)
    if (!details) return cb(new Error('No cabal found with key', key))
    console.log(key, channel, message)
    details.publishMessage({
      type: 'chat/text',
      content: {
        text: message.toString(),
        channel: channel || 'default'
      }
    }, cb)
  }
}

module.exports = Bot
