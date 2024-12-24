import BaseController from './BaseController'
import OrderConfirmationService from '../services/OrderConfirmationService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
const orderConfirmationService = new OrderConfirmationService('OrderConfirmation')

class OrderConfirmationController extends BaseController {
  async checkOwnerOrCompanyOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, record: orderConfirmation } = req

    if (currentUser.role === userRoles.ADMIN) {
      return next()
    }

    if (currentUser.role === userRoles.COMPANYADMINISTRATOR && orderConfirmation.companyId === currentUser.companyId) {
      return next()
    }

    if (orderConfirmation.owner.id === currentUser.id) {
      return next()
    }

    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'You are not authorized to access this order confirmation'
      }
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset, search, sortBy, filter } } = req

    const records = await orderConfirmationService.getAll(limit, offset, currentUser, search, sortBy, filter)
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
      [orderConfirmationService.manyRecords()]: records.rows
    })
  }
}

export default new OrderConfirmationController(orderConfirmationService)
