import sharp from 'sharp'
import { Request } from 'express'
import { getNameFromFullName, handleUploadSingleImage } from '~/utils/file'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
// import fs from 'fs'
// import { result } from 'lodash'
class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getNameFromFullName(file.newFilename)
    // console.log(path.resolve(UPLOAD_DIR))
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    // console.log(newPath)
    // console.log('file:', file)
    // jpeg({ quality: 50 }): giam chat luong 50%
    // console.log(file.filepath)
    const result = await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)

    return result
  }
}
const mediasService = new MediasService()
export default mediasService
