import BaseController from './BaseController'
import ProductCustomisationService from '../services/ProductCustomisationService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productCustomisationService = new ProductCustomisationService('ProductCustomisation')

class ProductCustomisationController extends BaseController {
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
    const { id: productCustomisationId } = req.params

    const record = await productCustomisationService.get(productCustomisationId)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.service.singleRecord()]: record
    })
  }

  async getAllProductCustomisationChats (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id: productCustomisationId }, query: { limit, page, offset } } = req

    const records = await productCustomisationService.getAllProductCustomisationChats(limit, offset, productCustomisationId)

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
      [productCustomisationService.manyRecords()]: records.rows
    })
  }

  async insertProductCustomisationChat (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { productCustomisationChat }, params: { id: productCustomisationId } } = req

    const { response, status } = await productCustomisationService.insertProductCustomisationChat({ user, productCustomisationChat, productCustomisationId })
    io.emit(`${String(productCustomisationService.recordName())}`, { message: `${String(productCustomisationService.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [productCustomisationService.singleRecord()]: response
    })
  }
}

export default new ProductCustomisationController(productCustomisationService)
