import BaseController from './BaseController'
import PendingOrderService from '../services/PendingOrderService'
import type { CustomRequest, CustomResponse, ICampaign, IPendingOrder, Module, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

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

    const {
      isQuotaEnabled, isExceedQuotaEnabled, usedQuota, totalOrderedQuota, correctionQuota,
      campaignOrderLimits, isBulkCreateEnabled
    } = campaign as ICampaign

    if (!isBulkCreateEnabled && pendingOrders.length > 1) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Bulk create is not enabled for this campaign'
        }
      })
    }

    const pendingOrdersQuantity: number = pendingOrders.reduce((accumulator: number, pendingOrder: IPendingOrder) => accumulator + pendingOrder.quantity, 0)
    const totalUsedQuota = usedQuota + correctionQuota
    const allowedRoles = [userRoles.ADMIN]

    if (!allowedRoles.includes(currentUser.role) && (isQuotaEnabled && !isExceedQuotaEnabled) && (totalUsedQuota + pendingOrdersQuantity) > totalOrderedQuota) {
      return res.status(statusCodes.TOO_MANY_REQUESTS).send({
        statusCode: statusCodes.TOO_MANY_REQUESTS,
        success: false,
        errors: {
          message: `Campaign quota has been exceeded by ${(totalUsedQuota + pendingOrdersQuantity) - totalOrderedQuota}`
        }
      })
    }

    const existingOrders = await pendingOrderService.findPendingOrders(currentUser.id, campaign.id)
    const campaignOrderLimit = campaignOrderLimits.find((campaignOrderLimit) => campaignOrderLimit.role === currentUser.role)

    if (campaignOrderLimit !== undefined && ((pendingOrdersQuantity + parseInt(existingOrders.count, 10)) > campaignOrderLimit.limit)) {
      return res.status(statusCodes.TOO_MANY_REQUESTS).send({
        statusCode: statusCodes.TOO_MANY_REQUESTS,
        success: false,
        errors: {
          message: `Campaign order limit has been exceeded by ${(pendingOrdersQuantity + parseInt(existingOrders.count, 10)) - campaignOrderLimit.limit}`
        }
      })
    }

    const { response, status } = await pendingOrderService.insert({ pendingOrders, currentUser, campaign })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

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

  async insertCataloguePendingOrders (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { pendingOrders }, user: currentUser } = req

    const { response, status } = await pendingOrderService.insertCataloguePendingOrders({ pendingOrders, currentUser })
    io.emit(`${String(pendingOrderService.recordName())}`, { message: `${String(pendingOrderService.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [pendingOrderService.manyRecords()]: response
    })
  }

  async duplicate (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { postedOrders }, user: currentUser } = req

    const response = await pendingOrderService.duplicate({ postedOrders, currentUser })

    if (response.message !== undefined) {
      return res.status(response.statusCode).send({
        statusCode: response.statusCode,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      pendingOrders: response
    })
  }
}

export default new PendingOrderController(pendingOrderService)
