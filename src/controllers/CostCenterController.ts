import BaseController from './BaseController'
import CostCenterService from '../services/CostCenterService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const costCenterService = new CostCenterService('CostCenter')

class CostCenterController extends BaseController {
  checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: costCenter } = req

    const company = costCenter.company

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwnerOrAdmin || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, company administrator, campaign manager or administrator can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { costCenter } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await costCenterService.insert({ company, costCenter })

    const statusCode = {
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
    const { limit, page, offset } = req.query
    const { id } = req.params
    const records = await costCenterService.getAllForCompany(limit, offset, id)
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
      [costCenterService.manyRecords()]: records.rows
    })
  }
}

export default new CostCenterController(costCenterService)
