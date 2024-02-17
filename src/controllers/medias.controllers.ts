import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'
// import formidable from 'formidable'

import { handleUploadSingleImage } from '~/utils/file'
// console.log('dirname', __dirname)
// console.log(path.resolve('uploads'))
export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await mediasService.handleUploadSingleImage(req)
  // const data = await handleUploadSingleImage(req)

  res.json({ data: data })
}
