import express from 'express'
import usersRouters from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import googleUserRouter from './routes/googles.user.routes'
import 'dotenv/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from './constants/dir'
const app = express()
const port = process.env.PORT

//tao thu muc
initFolder()

app.use(express.json())
databaseService.connect()
app.use('/users', usersRouters)
app.use('/api', googleUserRouter)
app.use('/medias', mediasRouter)
//get image
app.use('/medias/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/medias/videos', express.static(UPLOAD_VIDEO_TEMP_DIR))
app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})
