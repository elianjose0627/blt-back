import BaseController from './BaseController'
import ProductStockNotificationService from '../services/ProductStockNotificationService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
const productStockNotificationService = new ProductStockNotificationService('ProductStockNotification')

class ProductStockNotificationController extends BaseController {
  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { product: { company } } } = req

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser.companyId != null && company.id != null && currentUser.companyId === company.id

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, admin or employee can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product, body: { productStockNotification } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await productStockNotificationService.insert({ product, productStockNotification })

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

  async getAllProductStockNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, offset, page }, params: { id: productId } } = req

    const records = await productStockNotificationService.getAllProductStockNotifications(limit, offset, productId)

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
      [productStockNotificationService.manyRecords()]: records.rows
    })
  }
}

export default new ProductStockNotificationController(productStockNotificationService)
