import path from 'path'
import formidable, { File } from 'formidable'
import { Request } from 'express'
import fs from 'fs'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // muc dich de tao folder nested
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  // const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFields: 1, // so luong up len
    keepExtensions: true, // giu phan mo rong
    maxFieldsSize: 3000 * 1024, // du lieu anh toi da 3000Kb
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        //phat ra su kien
        form.emit('error' as any, new Error('File type is not valid') as any)
      }
      return valid
    }
  }) //300KB
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      resolve((files.image as File[])[0])
      // res.json({ message: 'upload success' })
    })
  })
}

export const getNameFromFullName = (name: string) => {
  const nameArr = name.split('.')
  nameArr.pop()
  return nameArr.join('')
}
