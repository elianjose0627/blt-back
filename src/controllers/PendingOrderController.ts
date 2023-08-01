import BaseController from './BaseController'
import PendingOrderService from '../services/PendingOrderService'
import { CustomRequest, CustomResponse, Module, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const pendingOrderService = new PendingOrderService('PendingOrder')

class PendingOrderController extends BaseController {
  moduleName (): Module {
    return 'orders'
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search, filter } } = req

    const records = await pendingOrderService.getAll(limit, offset, search, filter)
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
      [pendingOrderService.manyRecords()]: records.rows
    })
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { pendingOrders }, user: currentUser, record: campaign } = req

    if (campaign.company.customerId === null) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: `Contact admin to set the company customer id for ${String(campaign.company.name)} - ${String(campaign.company.id)}`
        }
      })
    }

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await pendingOrderService.insert({ pendingOrders, currentUser, campaign })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.manyRecords()]: response
    })
  }
}

export default new PendingOrderController(pendingOrderService)
