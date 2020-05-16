const req = require('require-yml')
const Bot = require('./')
const createServer = require('./server')

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
  if (argv.port || config.port) {
    const server = createServer(bot.say)

    server.listen(config.port, () => {
      console.log('Listening on', config.port)
    })
  }

  process.stdin.on('data', (data) => {
    bot.say(config.keys[0], config.channel, data.toString(), (err) => {
      if (err) console.error(err)
    })
  })
})

bot.on('mention', ({ key, channel, author, message }) => {
  console.log('do something', key, channel, author, message)
})
