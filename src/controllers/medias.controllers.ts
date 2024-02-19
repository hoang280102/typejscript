import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import httpStatus from '~/constants/httpStatus'
import { usersMessages } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'

// console.log('dirname', __dirname)
// console.log(path.resolve('uploads'))
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadImage(req)
  // const data = await handleUploadSingleImage(req)

  res.json({ message: usersMessages.UPLOAD_IMAGE_SUCCESS, result: result })
}
export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name))
}
export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadVideo(req)
  res.json({ message: usersMessages.UPLOAD_VIDEO_SUCCESS, result: result })
}
export const serveVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name))
}

// export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
//   const { range } = req.headers
//   if (!range) {
//     return res.status(httpStatus.BAD_REQUEST).send('requires range header')
//   }
//   const { name } = req.params
//   const videoPath = path.resolve(UPLOAD_VIDEO_TEMP_DIR, name)
//   //1MB= 10^6bytes(he 10) or 1MB=2^20 bytes(he nhi phan)

//   // dung luong video bytes
//   const videoSize = fs.statSync(videoPath).size
//   //dung luong video cho moi phan doan stream
//   const chunkSize = 10 ** 6 //1MB
//   //lay gia tri bytes bat dau
//   const start = Number(range.replace(/\D/g, ''))
//   // lay gia tri ket thuc, vuot qua dung luong video thi lay gia tri cuoi cung videoSize
//   const end = Math.min(start + chunkSize, videoSize)

//   const contentLength = end - start
//   const contentType = mime.getType(videoPath) ?? 'video/*'
//   const headers = {
//     'Content-Type': `bytes ${start}-${end}/${videoSize}`,
//     'Accept-Ranges': 'bytes',
//     'Content-Length': contentLength,
//     'Content-Type': contentType
//   }
//   res.writeHead(206, headers)
//   const videosStream = fs.createReadStream(videoPath, { start, end })
//   videosStream.pipe(res)
// }
