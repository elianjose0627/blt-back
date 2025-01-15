import BaseController from './BaseController'
import ProductCategoryService from '../services/ProductCategoryService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productCategoryService = new ProductCategoryService('ProductCategory')

class ProductCategoryController extends BaseController {
  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId, company } } = req

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = Boolean(companyId) && currentUser.companyId === companyId

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
    const { params: { id }, body: { productCategory } } = req

    const { response, status } = await productCategoryService.insert({ productCategory: id === undefined ? productCategory : { ...productCategory, companyId: id } })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

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

  async updateSortOrder (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productCategories } } = req

    const response = await productCategoryService.updateSortOrder({ productCategories })
    io.emit(`${String(productCategoryService.recordName())}`, { message: `${String(productCategoryService.recordName())} updated` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search, filter }, user } = req
    const records = await productCategoryService.getAll(limit, offset, search, filter, user)
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
      [productCategoryService.manyRecords()]: records.rows
    })
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id }, query: { limit, page, offset, search, filter }, record: company } = req

    const records = await productCategoryService.getAllForCompany(limit, offset, id, company.defaultProductCategoriesHidden, search, filter)
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
      productCategories: records.rows
    })
  }
}

export default new ProductCategoryController(productCategoryService)
