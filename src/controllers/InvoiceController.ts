import BaseController from './BaseController'
import InvoiceService from '../services/InvoiceService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
const invoiceService = new InvoiceService('Invoice')

class InvoiceController extends BaseController {
  async checkOwnerOrCompanyOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, record: invoice } = req

    if (currentUser.role === userRoles.ADMIN) {
      return next()
    }

    if (currentUser.role === userRoles.COMPANYADMINISTRATOR && invoice.companyId === currentUser.companyId) {
      return next()
    }

    if (invoice.owner.id === currentUser.id) {
      return next()
    }

    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'You are not authorized to access this invoice'
      }
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset, search, sortBy, filter } } = req

    const records = await invoiceService.getAll(limit, offset, currentUser, search, sortBy, filter)
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
      [invoiceService.manyRecords()]: records.rows
    })
  }
}

export default new InvoiceController(invoiceService)
