import express from 'express'
import usersRouters from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import googleUserRouter from './routes/googles.user.routes'
import 'dotenv/config'
import cors from 'cors'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
import morgan from 'morgan'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import tweetsRouter from './routes/tweets.routes'
import bookmarkRouter from './routes/bookmarks.routes'
import likeRouter from './routes/like.routes'
import searchRouter from './routes/search.routes'
import './utils/s3'
import { createServer } from 'http'
import { Server } from 'socket.io'
// import '~/utils/fakerdata'
// const options: swaggerJsdoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Hello World',
//       version: '1.0.0'
//     }
//   },

//   apis: ['./src/routes/*.routes.ts'] // files containing annotations as above
// }
// const openapiSpecification = swaggerJsdoc(options)

// // doc filed
// const file = fs.readFileSync(path.resolve('test-api.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const app = express()
const httpServer = createServer(app)
const port = process.env.PORT

// console.log(path.resolve())
//tao thu muc
initFolder()
//khoi dong database
databaseService.connect()

app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use('/users', usersRouters)
app.use('/api', googleUserRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarkRouter)
app.use('/likes', likeRouter)
app.use('/search', searchRouter)
//get image
// 'uploads/images'
app.use('/medias/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/medias/videos', express.static(UPLOAD_VIDEO_TEMP_DIR))
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'https://localhost:4000'
  }
})
io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`)
  })
  socket.on('hello', (arg) => {
    console.log(arg)
  })
  socket.emit('hi', { message: `Hello ${socket.id}, i am a ai` })
})
httpServer.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})
