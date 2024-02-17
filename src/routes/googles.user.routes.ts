import { Router } from 'express'
import { loginGoogleControllers } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
const googleUserRouter = Router()
googleUserRouter.get('/oauth/google', wrapRequestHandler(loginGoogleControllers))
export default googleUserRouter
