import sharp from 'sharp'
import { Request } from 'express'
import { getNameFromFullName, getNameType, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import mime from 'mime'
import 'dotenv/config'
import { isProduction } from '~/utils/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Orther'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { uploadAWSS3 } from '~/utils/s3'
import { promiseFsUnlink } from '~/utils/promise-unlink'

// import { result } from 'lodash'
class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        // console.log(path.resolve(UPLOAD_IMAGE_DIR))
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        // console.log(newPath)
        // console.log('file:', file)
        // jpeg({ quality: 50 }): giam chat luong 50%
        // console.log(file.filepath)
        await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)
        // tam cmt
        const s3Result = await uploadAWSS3({
          filename: 'images/' + newFullFileName,
          filepath: newPath,
          contentType: mime.getType(newFullFileName) as string
        })
        // tam cmt

        await Promise.all([promiseFsUnlink(file.filepath), promiseFsUnlink(newPath)])

        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/medias/image/${newName}.jpg`
        //     : `http://localhost:${process.env.PORT}/medias/image/${newName}.jpg`,
        //   type: MediaType.Image
        // }
        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }
  async handleUploadVideo(req: Request) {
    const file = await handleUploadVideo(req)
    // console.log(file)
    const { newFilename, originalFilename } = file[0]
    const type = getNameType(originalFilename as string)
    const newName = newFilename + '.' + type
    // console.log(result)
    const s3Result = await uploadAWSS3({
      filename: 'videos/' + newName,
      filepath: file[0].filepath,
      contentType: mime.getType(newName) as string
    })
    await promiseFsUnlink(file[0].filepath)
    // console.log(newFilename)
    return {
      url: s3Result.Location as string,
      type: MediaType.Video
    }
    // return {
    //   url: isProduction
    //     ? `${process.env.HOST}/medias/videos/${newFilename}`
    //     : `http://localhost:${process.env.PORT}/medias/videos/${newFilename}`,
    //   type: MediaType.Video
    // }
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/videos/${file.filepath}`
            : `http://localhost:${process.env.PORT}/static/videos/${file.filepath}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}
const mediasService = new MediasService()
export default mediasService
