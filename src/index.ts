import express from 'express'
import usersRouters from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFolder } from './utils/file'
import googleUserRouter from './routes/google.user.routes'

const app = express()

//tao thu muc
initFolder()

app.use(express.json())
databaseService.connect()
app.use('/users', usersRouters)
app.use('/api', googleUserRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)
app.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})
