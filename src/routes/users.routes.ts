import { wrapRequestHandler } from './../utils/handlers'
import { Router } from 'express'

import {
  EmailVerifyValidatorController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refereshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
const usersRouters = Router()

usersRouters.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouters.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouters.post('/logout', accessTokenValidator, refereshTokenValidator, wrapRequestHandler(logoutController))
usersRouters.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(EmailVerifyValidatorController))

export default usersRouters
