import multer from 'multer'
import { CustomRequest } from '../types'

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: CustomRequest, file: Express.Multer.File, callback: any) => {
    const allowedTypes = ['text/xml', 'application/xml', 'text/plain']
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error('Invalid file type. Only XML and TXT files are allowed.'))
    }
    callback(null, true)
  }
})

export const uploadFile = upload.any()
