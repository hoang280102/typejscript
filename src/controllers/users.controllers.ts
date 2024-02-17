import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  ResetPasswordReqBody,
  TokenPayLoad,
  UpdateMeReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody,
  FollowReqBody,
  UnFollowReqParams,
  ChangePasswordReqBody
} from './../models/requests/User.requests'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { access } from 'fs'
import { pick } from 'lodash'
// import { result } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/Users.schemas'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import 'dotenv/config'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  // console.log(user)
  const user_id = user._id
  // console.log(user_id)
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({ message: usersMessages.LOGIN_SUCCESS, result })
}

export const loginGoogleControllers = async (req: Request, res: Response) => {
  // console.log(req.url)
  const { code } = req.query
  const result = await usersService.Oauth(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_URL_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify}`
  return res.redirect(urlRedirect)
  // res.json({
  //   message: usersMessages.LOGIN_SUCCESS,
  //   result: {
  //     access_token: result.access_token,
  //     refresh_token: result.refresh_token
  //   }
  // })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({ message: usersMessages.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json({
    message: usersMessages.LOG_OUT_SUCCESS,
    result
  })
}

export const EmailVerifyValidatorController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: usersMessages.USER_NOT_FOUND })
  }

  //da verify roi ko bao loi
  // tra ve status ok voi message la da verify roi
  if (user.email_verify_token === ' ') {
    return res.status(httpStatus.Ok).json({ message: usersMessages.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  //neu chua verify
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: usersMessages.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: usersMessages.USER_NOT_FOUND })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: usersMessages.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json({ result })
}

export const forgotPasswordControllers = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User

  const result = await usersService.ForgotPasswordToken({ user_id: _id.toString(), verify })
  return res.json(result)
}
export const VerifyForgotPasswordToken = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  return res.json({ message: usersMessages.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  // return res.json({ message: usersMessages.RESET_PASSWORD_SUCCESS })
  const { user_id } = req.decoded_forgot_password_token as TokenPayLoad
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  res.json({ message: usersMessages.RESET_PASSWORD_SUCCESS, result })
}

export const getMeController = async (req: Request, res: Response) => {
  // console.log('test', req.decoded_authorzation)
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const user = await usersService.getMe(user_id)
  return res.json({ message: usersMessages.GET_ME_SUCCESS, result: user })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad

  const body = pick(req.body, [
    'name',
    'day_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ])
  const user = await usersService.updateMe(user_id, body)
  return res.json({ message: usersMessages.UPDATE_ME_SUCCESS, result: user })
}
export const getProfileController = async (req: Request, res: Response) => {
  return res.json({ message: 'success' })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { followed_user_id } = req.body
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unFollowController = async (req: Request<ParamsDictionary, any, UnFollowReqParams>, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad

  const { user_id: follow_user_id } = req.params
  const result = await usersService.unfollow(user_id, follow_user_id)
  return res.json({ result })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json({ result })
}
