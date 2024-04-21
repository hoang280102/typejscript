import { TokenPayLoad } from '~/models/requests/User.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { likeReqBody } from '~/models/requests/like.request'
import likeService from '~/services/like.services'
export const likeController = async (req: Request<ParamsDictionary, any, likeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await likeService.like(user_id, req.body.tweet_id)
  return res.json({
    message: 'like successfully',
    result
  })
}

export const unlikeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await likeService.unlike(user_id, req.params.tweet_id)
  return res.json({
    message: 'unlike successfully',
    result
  })
}
