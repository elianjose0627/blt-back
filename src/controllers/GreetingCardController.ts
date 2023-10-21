import BaseController from './BaseController'
import GreetingCardService from '../services/GreetingCardService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const greetingCardService = new GreetingCardService('GreetingCard')

class GreetingCardController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { greetingCard } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await greetingCardService.insert({ greetingCard })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.recordName()]: response
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, filter, search } } = req
    const records = await greetingCardService.getAll(limit, offset, search, filter)
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
      [greetingCardService.manyRecords()]: records.rows
    })
  }
}

export default new GreetingCardController(greetingCardService)
