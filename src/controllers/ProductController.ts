import BaseController from './BaseController'
import ProductService from '../services/ProductService'
import CompanyService from '../services/CompanyService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productService = new ProductService('Product')
const companyService = new CompanyService('Company')

class ProductController extends BaseController {
  checkOwnerOrAdminOrCompanyAdministratorOrCampaignManager (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId, company } } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]

    const isOwnerOrAdmin = currentUser?.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, admin, company administrator or campaign manager can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { product } } = req

    // Used != to capture value that is undefined
    if (product?.companyId != null) {
      const company = await companyService.findById(product.companyId)
      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: 'Company not found'
          }
        })
      }
    }

    const { response, status } = await productService.insert({ company, product })

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset } = req.query
    const { id } = req.params
    const records = await productService.getAllForCompany(limit, offset, id)
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
      [productService.manyRecords()]: records.rows
    })
  }
}

export default new ProductController(productService)
