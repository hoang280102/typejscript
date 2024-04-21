import { Router } from 'express'
import { likeController, unlikeController } from '~/controllers/like.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const likeRouter = Router()

likeRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(likeController)
)
likeRouter.delete(
  '/unlikes/:tweet_id',
  accessTokenValidator,
  verifyUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(unlikeController)
)

export default likeRouter
