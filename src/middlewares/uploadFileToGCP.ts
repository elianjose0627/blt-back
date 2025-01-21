import { Request, Response } from 'express'
import dayjs from 'dayjs'
import * as statusCodes from '../constants/statusCodes'
import { uploadToGCS } from '../utils/storage'
import { CustomNext } from '../types'

const uploadFileToGCP = async (req: Request, res: Response, next: CustomNext): Promise<any> => {
  try {
    if (req.files === undefined || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'No files uploaded.'
        }
      })
    }
    for (const file of req.files) {
      const fileName = `${dayjs().format('YYYY_MM_DD')}_${file.originalname}`
      await uploadToGCS(fileName, file.buffer)
    }

    return next()
  } catch (error: any) {
    return res.status(statusCodes.BAD_REQUEST).send({
      statusCode: statusCodes.BAD_REQUEST,
      success: false,
      errors: {
        message: error.message
      }
    })
  }
}
export default uploadFileToGCP
