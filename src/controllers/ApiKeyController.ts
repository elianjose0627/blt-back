import BaseController from './BaseController'
import ApiKeyService from '../services/ApiKeyService'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'
import { io } from '../utils/socket'

const apiKeyService = new ApiKeyService('ApiKey')

class ApiKeyController extends BaseController {
  checkOwner (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: apiKey } = req

    const isOwner = currentUser.id === apiKey.user.id

    if (isOwner) {
      req.isOwner = true
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, body: { apiKey } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const response = await apiKeyService.insert({ apiKey, currentUser })

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [this.recordName()]: response
    })
  }

  async getAllForCurrentUser (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, user: currentUser } = req

    const records = await apiKeyService.getAllForCurrentUser(limit, offset, currentUser.id)
    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [apiKeyService.manyRecords()]: records.rows
    })
  }
}

export default new ApiKeyController(apiKeyService)
