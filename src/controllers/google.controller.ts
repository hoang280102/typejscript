import { LoginReqBody } from '~/models/requests/User.requests'
import { Request, Response } from 'express'
import { usersMessages } from '~/constants/messages'

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query

  console.log(req.url)
  return res.json({
    message: usersMessages.LOGIN_SUCCESS
  })
}
