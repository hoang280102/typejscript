import { LogoutReqBody, TokenPayLoad } from './../models/requests/User.requests'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/Users.schemas'
import databaseService from '~/services/database.services'
// import User from '~/models/schemas/Users.schemas'
// import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  // console.log(user)
  const user_id = user._id
  // console.log(user_id)
  const result = await usersService.login(user_id.toString())
  res.json({ message: usersMessages.LOGIN_SUCCESS, result })
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

export const EmailVerifyValidatorController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayLoad
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  // console.log(user)
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
