const express = require('express'),
    routes = require('./lib/routes'),
    testRoutes = require('./lib/testRoutes'),
    bodyparser = require('body-parser'),
    morgan = require('morgan')

const {PORT, HOST} = require('./lib/config'),
    expressApp = express()

expressApp.use(express.static(__dirname + "/public/"))
    .use(bodyparser.urlencoded({extended: true}))
    .use(morgan('tiny'))
    .disable('x-powered-by')

// ROUTES
expressApp.get('/', routes.home)

expressApp.get('/download/:manga/:chapter', routes.downloadMiddleware)
expressApp.get('/download/:manga/:chapter', routes.downloadMsg)
expressApp.get('/download/:manga/:chapter/progress', routes.downloadProgress)

expressApp.get('/encode', routes.encodeMiddleware)
expressApp.get('/encode', routes.encodeMsg)
expressApp.get('/encode/progress', routes.encodeProgress)

// Test routes
expressApp.get('/encode/test', testRoutes.testEncodeMiddleware)
expressApp.get('/encode/test', testRoutes.testEncodeMsg)
expressApp.get('/encode/test/progress', testRoutes.testEncodeProgress)

expressApp.listen(PORT, () => {
    console.log(`Express app started at ${HOST}:${PORT}`)
})