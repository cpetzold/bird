var path = require('path')
  , express = require('express')
  , derby = require('derby')
  , gzip = require('connect-gzip')
  , bird = require('../bird')


// SERVER CONFIGURATION //

var MAX_AGE_ONE_YEAR = { maxAge: 1000 * 60 * 60 * 24 * 365 }
  , root = path.dirname(path.dirname(__dirname))
  , publicPath = path.join(root, 'public')
  , staticPages = derby.createStatic(root)
  , server, store

;(module.exports = server = express.createServer())
  // The express.static middleware can be used instead of gzip.staticGzip
  .use(gzip.staticGzip(publicPath, MAX_AGE_ONE_YEAR))
  .use(express.favicon())

  // Uncomment to add form data parsing support
  // .use(express.bodyParser())
  // .use(express.methodOverride())

  // Uncomment and supply secret to add Derby session handling
  // Derby session middleware creates req.model and subscribes to _session
  // .use(express.cookieParser())
  // .use(express.session({ secret: '', cookie: MAX_AGE_ONE_YEAR }))
  // .use(bird.session())

  // Remove to disable dynamic gzipping
  .use(gzip.gzip())

  // The router method creates an express middleware from the app's routes
  .use(bird.router())
  .use(server.router)


// ERROR HANDLING //

server.configure('development', function() {
  // Log errors in development only
  server.error(function(err, req, res, next) {
    if (err) console.log(err.stack ? err.stack : err)
    next(err)
  })
})

server.error(function(err, req, res) {
  // Customize error handling here //
  var message = err.message || err.toString()
    , status = parseInt(message)
  if (status === 404) {
    staticPages.render('404', res, {url: req.url}, 404)
  } else {
    res.send( ((status >= 400) && (status < 600)) ? status : 500 )
  }
})


// SERVER ONLY ROUTES //

server.all('*', function(req) {
  throw '404: ' + req.url
})


// STORE SETUP //

store = bird.createStore({ listen: server })
