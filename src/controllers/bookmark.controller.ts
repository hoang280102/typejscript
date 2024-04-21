import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { BookmarkTweetReqBody } from '~/models/requests/bookmark.requests'
import { TokenPayLoad } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmark.services'

export const bookmarkController = async (req: Request<ParamsDictionary, any, BookmarkTweetReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: 'bookmark successfully',
    result
  })
}
export const unbookmarkController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await bookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)
  return res.json({ mesasage: 'unbookmark successfully', result })
}
