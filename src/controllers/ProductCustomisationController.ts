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
    const { user: currentUser, record: { owner: { id } } } = req

    const isOwnerOrAdmin = currentUser.id === id || currentUser.role === userRoles.ADMIN

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
    const { user: currentUser, query: { limit, page, offset, search, filter } } = req

    const records = await productCustomisationService.getAll(limit, offset, search, filter, currentUser)
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

  async delete (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await this.service.delete(record)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} deleted` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }

  async getAllChat (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { id: productCustomisationId } = req.params

    const records = await productCustomisationService.getAllChat(productCustomisationId)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      ProductCustomisationChats: records.rows
    })
  }

  async insertChat (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { productCustomisationChat }, params: { id: productCustomisationId } } = req

    const { response, status } = await productCustomisationService.insertChat({ user, productCustomisationChat, productCustomisationId })
    io.emit('ProductCustomisationChats', { message: 'ProductCustomisationChats created' })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      ProductCustomisationChat: response
    })
  }
}

export default new ProductCustomisationController(productCustomisationService)
