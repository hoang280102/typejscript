import express from 'express'
import usersRouters from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
const app = express()

app.use(express.json())
databaseService.connect()
app.use('/users', usersRouters)
app.use(defaultErrorHandler)
app.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})
