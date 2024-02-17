import { Router } from 'express'
import { loginGoogleController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const googleUserRouter = Router()
googleUserRouter.get('/oauth/google', wrapRequestHandler(loginGoogleController))
export default googleUserRouter
