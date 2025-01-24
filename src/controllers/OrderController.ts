import BaseController from './BaseController'
import OrderService from '../services/OrderService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const orderService = new OrderService('Order')

class OrderController extends BaseController {
  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset, search, filter } } = req

    const records = await orderService.getAll(limit, offset, currentUser, search, filter)
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
      [orderService.manyRecords()]: records.rows
    })
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { order } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await orderService.insert({ order })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async getOrderByPostedOrderId (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { postedOrderId } } = req

    const order = await orderService.getOrderByPostedOrderId(postedOrderId)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      order
    })
  }
}

export default new OrderController(orderService)
