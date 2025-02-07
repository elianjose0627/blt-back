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
  async checkRecord (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { productCustomisationId } = req.params
    const record = await this.service.findById(productCustomisationId)

    if (record === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(this.service.recordName())} not found`
        }
      })
    }
    req.record = record
    return next()
  }

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
    const { record: initialProduct, user, params: { id: productId }, body: { productCustomisation } } = req

    let product = initialProduct

    product = await productService.findById(productId)

    if (product === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(productService.model)} not found`
        }
      })
    }

    const { response, status } = await productCustomisationService.insert({ user, productId, productCustomisation })
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
    const { user: currentUser, params: { id: productId }, query: { limit, page, offset } } = req

    const records = await productCustomisationService.getAllProductCustomisation(limit, offset, productId, currentUser)
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

  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { productCustomisationId } = req.params

    const record = await productCustomisationService.get(productCustomisationId)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      ProductCustomisation: record
    })
  }

  async update (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, params: { productCustomisationId }, body: { productCustomisation } } = req

    const response = await this.service.update({ user, productCustomisationId, productCustomisation })

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async delete (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await this.service.delete(record)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} deleted` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }

  async getAllChat (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { productCustomisationId } = req.params

    const records = await productCustomisationService.getAllChat(productCustomisationId)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      ProductCustomisationChats: records.rows
    })
  }

  async insertChat (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { productCustomisationChat }, params: { productCustomisationId } } = req

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
