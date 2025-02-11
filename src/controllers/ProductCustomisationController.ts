import BaseController from './BaseController'
import ProductCustomisationService from '../services/ProductCustomisationService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productCustomisationService = new ProductCustomisationService('ProductCustomisation')

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

  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { owner, companyId } } = req

    const isOwnerOrAdmin = currentUser.id === owner.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser.companyId != null && companyId != null && currentUser.companyId === companyId

    if (isOwnerOrAdmin || isEmployee) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, employee or admin can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, params: { id: productId }, body: { productCustomisation } } = req
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

    const records = await productCustomisationService.getAllProductCustomisations(limit, offset, productId, currentUser)
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
      productCustomisation: record
    })
  }

  async getAllChats (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { productCustomisationId } = req.params

    const records = await productCustomisationService.getAllChats(productCustomisationId)

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
