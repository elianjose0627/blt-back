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
    const { user: currentUser, files } = req
    try {
      if (files === undefined || !Array.isArray(files) || files.length === 0) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: 'No files uploaded.'
          }
        })
      }

      const parsedData = []
      for (const file of files) {
        // Parse XML content
        const xmlContent = file.buffer.toString('utf-8')
        const parsedFileData = await parseXml(xmlContent)
        if (parsedFileData.status === false) {
          console.log('first file controller', parsedFileData)
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
      console.log('first file controller second', error)
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
