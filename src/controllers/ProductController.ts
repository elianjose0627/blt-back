import BaseController from './BaseController'
import ProductService from '../services/ProductService'
import CompanyService from '../services/CompanyService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productService = new ProductService('Product')
const companyService = new CompanyService('Company')

class ProductController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId, company } } = req

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = Boolean(companyId) && currentUser?.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
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

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset, search } = req.query
    const records = await productService.getAll(limit, offset, search)

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

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset, search } = req.query
    const { id } = req.params
    const records = await productService.getAllForCompany(limit, offset, id, search)

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

  async getProductStock (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product } = req
    const stock = await productService.getProductStock(product)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      stock
    })
  }

  async getProductOutbounds (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product, query: { limit, page, offset } } = req
    const records = await productService.getProductOutbounds(offset, product)

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
      outbounds: records.rows
    })
  }

  async updateProductCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { product: { companyId } } } = req

    if (companyId !== null) {
      const company = await companyService.findById(companyId)
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
    const updatedRecord = await productService.update(record, { companyId })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      product: updatedRecord
    })
  }
}

export default new ProductController(productService)
