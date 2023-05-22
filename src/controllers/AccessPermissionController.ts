import BaseController from './BaseController'
import AccessPermissionService from '../services/AccessPermissionService'
import CompanyService from '../services/CompanyService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const accessPermissionService = new AccessPermissionService('AccessPermission')
const companyService = new CompanyService('Company')

class AccessPermissionController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: accessPermission } = req

    const company = accessPermission.company

    const isOwnerOrAdmin = currentUser.id === company?.owner.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company.id

    if (isOwnerOrAdmin || (isEmployee)) {
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
    const { body: { accessPermission }, record: initialCompany } = req

    let company = initialCompany

    if (accessPermission.companyId !== undefined) {
      company = await companyService.findById(accessPermission.companyId)

      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: `${String(companyService.model)} not found`
          }
        })
      }
    }

    const { response, status } = await accessPermissionService.insert({ accessPermission, company })
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

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id } } = req

    const records = await accessPermissionService.getAllForCompany(limit, offset, id)
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
      [accessPermissionService.manyRecords()]: records.rows
    })
  }
}

export default new AccessPermissionController(accessPermissionService)
