/* eslint-disable no-extra-boolean-cast */
import formidable, { File } from 'formidable'
import { Request } from 'express'
import fs from 'fs'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.mkdirSync(file, {
        recursive: true // muc dich de tao folder nested
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFields: 4, // so luong up len
    keepExtensions: true, // giu phan mo rong
    maxFieldsSize: 3000 * 1024, // du lieu anh toi da 3000Kb
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        //phat ra su kien
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  }) //300KB
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // if (!files.image) {
      //   return reject(new Error('File is empty'))
      // }
      // console.log(files.image)
      resolve(files.image as File[])
      // res.json({ message: 'upload success' })
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_TEMP_DIR,
    maxFields: 1,
    maxFieldsSize: 50 * 1024 * 1024,
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve(files.video as File[])
      // console.log(files.video)
    })
  })
}

export const getNameFromFullName = (name: string) => {
  const nameArr = name.split('.')
  nameArr.pop()
  return nameArr.join('')
}
