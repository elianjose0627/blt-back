import multer from 'multer'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'

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

const uploadFile = upload.any()

export const uploadToMemory = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  uploadFile(req, res, function (err) {
    if (err instanceof Error) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: err.message
        }
      })
    }

    return next()
  })
}
