import sharp from 'sharp'
import { Request } from 'express'
import { getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'

import 'dotenv/config'
import { isProduction } from '~/utils/config'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Orther'
// import { result } from 'lodash'
class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        // console.log(path.resolve(UPLOAD_IMAGE_DIR))
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        // console.log(newPath)
        // console.log('file:', file)
        // jpeg({ quality: 50 }): giam chat luong 50%
        // console.log(file.filepath)
        await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)
        // fs.unlinkSync(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/image/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/medias/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async handleUploadVideo(req: Request) {
    const file = await handleUploadVideo(req)
    // console.log(file[0].newFilename)
    const { newFilename } = file[0]
    // console.log(newFilename)
    return {
      url: isProduction
        ? `${process.env.HOST}/medias/videos/${newFilename}`
        : `http://localhost:${process.env.PORT}/medias/videos/${newFilename}`,
      type: MediaType.Video
    }
  }
}
const mediasService = new MediasService()
export default mediasService
