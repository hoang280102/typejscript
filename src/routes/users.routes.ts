import { wrapRequestHandler } from './../utils/handlers'
import { Router } from 'express'

import {
  EmailVerifyValidatorController,
  VerifyForgotPasswordToken,
  changePasswordController,
  followController,
  forgotPasswordControllers,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMeController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changPasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refereshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifyForgotPasswordTokenValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
const usersRouters = Router()

usersRouters.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouters.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouters.post('/logout', accessTokenValidator, refereshTokenValidator, wrapRequestHandler(logoutController))
usersRouters.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(EmailVerifyValidatorController))
usersRouters.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouters.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordControllers))
usersRouters.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(VerifyForgotPasswordToken)
)
usersRouters.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

usersRouters.get('/get-me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouters.patch(
  '/me',
  accessTokenValidator,
  verifyUserValidator as any,
  updateMeValidator,
  wrapRequestHandler(updateMeController)
)
usersRouters.get('/:username', wrapRequestHandler(getProfileController))

usersRouters.post(
  '/follow',
  accessTokenValidator,
  verifyUserValidator as any,
  followValidator,
  wrapRequestHandler(followController)
)

usersRouters.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifyUserValidator as any,
  unfollowValidator,
  wrapRequestHandler(unFollowController)
)

usersRouters.put(
  '/change-password',
  accessTokenValidator,
  verifyUserValidator as any,
  changPasswordValidator,
  wrapRequestHandler(changePasswordController)
)
export default usersRouters
