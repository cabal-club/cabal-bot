const req = require('require-yml')
const Bot = require('../')

var argv = require('minimist')(process.argv.slice(2))

if (!argv._[0]) {
  console.error('cabal /path/to/my/cabal/config.yml')
  process.exit(1)
}

let config = req(argv._[0])
console.log(config)

const bot = new Bot({
  config: {
    dbdir: config.dbdir || '/tmp/cabals'
  },
  nickname: config.nickname
})

bot.join(config.keys, (err) => {
  if (err) throw err
})

bot.on('mention', ({ key, channel, author, message }) => {
  if (/ping/.test(message.value.content.text)) {
    var msg = `${author.name}: pong`
    bot.say(key, channel, msg, (err) => {
      if (err) console.error(err)
    })
  }
})
