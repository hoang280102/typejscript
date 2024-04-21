import { ParamsDictionary } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express'
import { Pagination, TweetParam, TweetQuery, TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetsService from '~/services/tweets.services'
import { TokenPayLoad } from '~/models/requests/User.requests'
import { TweetType } from '~/constants/enum'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const result = await tweetsService.createTweet(user_id, req.body)
  res.status(200).json(result)
}
export const getTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  // const { user_id } = req.decoded_authorzation as TokenPayLoad
  // const result = await tweetsService.createTweet(user_id, req.body)
  const { user_id } = req.decoded_authorzation as TokenPayLoad

  const result = await tweetsService.inscreaseView(req.params.tweet_id, user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result?.guest_views,
    user_views: result?.user_views,
    views: (result?.guest_views as number) + (result?.user_views as number)
  }
  res.status(200).json({ message: 'get tweet success', result: tweet })
}
export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type as string) as TweetType
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const { user_id } = req.decoded_authorzation as TokenPayLoad
  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type: tweet_type,
    limit: limit,
    page: page,
    user_id
  })
  return res.json({
    message: 'get success',
    result: { tweets, tweet_type, limit, page, total_page: Math.ceil(total / limit) }
  })
}

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const user_id = req.decoded_authorzation?.user_id as string
  const limit = Number(req.query.limit as string)
  const page = Number(req.query.page as string)
  const result = await tweetsService.getNewFeeds({ user_id, limit, page })
  return res.json(result)
}
