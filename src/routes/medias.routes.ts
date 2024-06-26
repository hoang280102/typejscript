import { Router } from 'express'
import {
  serveImageController,
  serveVideoStreamController,
  uploadImageController,
  uploadVideoController,
  uploadVideoHLSController
} from '~/controllers/medias.controllers'

import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifyUserValidator as any,
  wrapRequestHandler(uploadImageController)
)

//get image
mediasRouter.get(
  '/images/:name',
  // accessTokenValidator,
  // verifyUserValidator as any,
  wrapRequestHandler(serveImageController)
)

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifyUserValidator as any,
  wrapRequestHandler(uploadVideoController)
)
mediasRouter.get(
  '/videos-stream/:name',
  // accessTokenValidator,
  // verifyUserValidator as any,
  // wrapRequestHandler(serveVideoController)
  wrapRequestHandler(serveVideoStreamController)
)
mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifyUserValidator as any,
  wrapRequestHandler(uploadVideoHLSController)
)
export default mediasRouter
