const url = require('url')
const http = require('http')
const Router = require('routes')
const body = require('body')

module.exports = (onpublish) => {
  var router = new Router()

  router.addRoute('/:key/:channel', function (req, res, match) {
    console.log(req.url)
    body(req, (err, message) => {
      if (err) res.end(err)
      var p = match.params
      onpublish(p.key, p.channel, message, (err) => {
        if (err) return res.end(err.toString())
        res.end('OK')
      })
    })
  })

  var server = http.createServer((req, res) => {
    var path = url.parse(req.url).pathname
    var match = router.match(path)
    if (match) match.fn(req, res, match)
    else {
      res.end('404')
    }
  })

  return server
}
