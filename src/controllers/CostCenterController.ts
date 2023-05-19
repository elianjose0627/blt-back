import BaseController from './BaseController'
import CostCenterService from '../services/CostCenterService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const costCenterService = new CostCenterService('CostCenter')

class CostCenterController extends BaseController {
  checkOwnerAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: costCenter } = req

    const company = costCenter.company

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwnerOrAdmin || (isEmployee)) {
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
    const { record: company, body: { costCenter } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await costCenterService.insert({ company, costCenter })

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
    const { limit, page, offset, search } = req.query
    const { id } = req.params
    let records

    if (search !== undefined) {
      records = await costCenterService.searchCostCenters(limit, offset, id, search)
    } else {
      records = await costCenterService.getAllForCompany(limit, offset, id)
    }
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
