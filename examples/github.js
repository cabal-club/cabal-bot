const { Webhooks } = require('@octokit/webhooks')
const Bot = require('../')
const path = require('path')
const req = require('require-yml')

const CHANNEL = 'github'

let config = req(path.join(__dirname, 'config.yml'))

var bot = new Bot({
  config: {
    dbdir: config.dbdir || '/tmp/cabals'
  },
  nickname: config.nickname
})

const webhooks = new Webhooks({
  secret: process.env.GITHUB_SECRET
})

webhooks.on('*', ({ id, name, payload }) => {
  try {
    console.log(id, name, payload)
    let message = ''
    switch (name) {
      case 'push':
        message = `[${payload.repository.full_name}] ${payload.pusher.name} pushed ${payload.commits.length} commits.`
        break
      case 'reopened':
      case 'closed':
      case 'created':
        message = `[${payload.organization.login}/${payload.repository.name}] ${payload.issue.user.login} ${name} ${payload.issue.title} ${payload.issue.html_url}`
        break
      case 'issue_comment':
        message = `[${payload.organization.login}/${payload.repository.name}] ${payload.comment.user.login}: ${payload.comment.body.slice(0, 20)}...${payload.comment.html_url}`
        break
      default:
        message = false
    }

    if (!message) return

    bot.say(config.keys[0], CHANNEL, message, (err) => {
      if (err) console.error(err)
    })
  } catch (err) {
    console.error(err)
  }
})

bot.join(config.keys, (err) => {
  if (err) throw err
  require('http').createServer(webhooks.middleware).listen(config.port)
})
