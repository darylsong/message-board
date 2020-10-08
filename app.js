const express = require('express')
const app = express()
const mongoose = require('mongoose')
const config = require('./utils/config')
const cors = require('cors')
const middleware = require('./utils/middleware')

const commentRouter = require('./controllers/comments')
const postRouter = require('./controllers/posts')
const sectionRouter = require('./controllers/sections')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)
app.use(express.static('build'))

app.use('/comments', commentRouter)
app.use('/posts', postRouter)
app.use('/sections', sectionRouter)
app.use('/users', userRouter)
app.use('/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app