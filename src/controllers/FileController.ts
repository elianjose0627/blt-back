import { Request, Response } from 'express'

import BaseController from './BaseController'
import FileService from '../services/FileService'
import * as statusCodes from '../constants/statusCodes'
import { io } from '../utils/socket'
import { parseXml } from '../utils/parseXML'
import { StatusCode } from '../types'

const fileService = new FileService('file')
class FileController extends BaseController {
  async insertPendingOrder (req: Request, res: Response): Promise<any> {
    const { user: currentUser } = req
    const files: Express.Multer.File[] = req.files as Express.Multer.File[]
    try {
      const parsedData = []
      for (const file of files) {
        // Parse XML content
        const xmlContent = file.buffer.toString('utf-8')
        const parsedFileData = await parseXml(xmlContent)
        if (parsedFileData.status === false) {
          return res.status(statusCodes.BAD_REQUEST).send({
            statusCode: statusCodes.BAD_REQUEST,
            success: false,
            errors: {
              message: parsedFileData.message
            }
          })
        }
        parsedData.push(parsedFileData.xmlDoc)
      }

      const { response, status } = await fileService.insert({ currentUser, parsedData })
      io.emit('pendingOrders', { message: 'pendingOrders created' })

      const statusCode: StatusCode = {
        200: statusCodes.OK,
        201: statusCodes.CREATED
      }

      return res.status(statusCode[status]).send({
        statusCode: statusCode[status],
        success: true,
        pendingOrders: response
      })
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
}

export default new FileController(fileService)
