import BaseController from './BaseController'
import ProductCustomisationService from '../services/ProductCustomisationService'
import ProductService from '../services/ProductService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productCustomisationService = new ProductCustomisationService('ProductCustomisation')

const productService = new ProductService('Product')

class ProductCustomisationController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: productCustomisation } = req

    const owner = productCustomisation.owner

    const isOwnerOrAdmin = currentUser.id === owner.id || currentUser.role === userRoles.ADMIN

    if (isOwnerOrAdmin) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or admin can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: initialProduct, user, body: { productCustomisation } } = req

    let product = initialProduct

    product = await productService.findById(productCustomisation.productId)

    if (product === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(productService.model)} not found`
        }
      })
    }

    const { response, status } = await productCustomisationService.insert({ user, productCustomisation })
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

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset, search, sortBy, filter } } = req

    const records = await productCustomisationService.getAll(limit, offset, search, filter, sortBy, currentUser)
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
      [this.service.manyRecords()]: records.rows
    })
  }
}

export default new ProductCustomisationController(productCustomisationService)
