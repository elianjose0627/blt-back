import BaseController from './BaseController'
import CompanyService from '../services/CompanyService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companyService = new CompanyService('Company')

class CompanyController extends BaseController {
  checkOwnerOrCampaignManager (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: company } = req

    const allowedRoles = ['CampaignManager']

    const isOwner = currentUser?.id === company?.owner?.id
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwner || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or campaign manager can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { company } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await companyService.insert({ user, company })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      company: response
    })
  }

  async getAllUsers (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id: companyId } } = req
    const records = await companyService.getAllUsers(limit, offset, companyId)
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
      users: records.rows
    })
  }
}

export default new CompanyController(companyService)
