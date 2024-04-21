import { Router } from 'express'
import { bookmarkController, unbookmarkController } from '~/controllers/bookmark.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarkRouter = Router()

bookmarkRouter.post(
  '/',
  accessTokenValidator,
  verifyUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(bookmarkController)
)
bookmarkRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifyUserValidator as any,
  tweetIdValidator,
  wrapRequestHandler(unbookmarkController)
)
export default bookmarkRouter
