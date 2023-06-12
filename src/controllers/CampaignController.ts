import BaseController from './BaseController'
import CampaignService from '../services/CampaignService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const campaignService = new CampaignService('Campaign')

class CampaignController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId, company: { owner } } } = req

    const isOwnerOrAdmin = currentUser?.id === owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === companyId

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
    const { record: company, body: { campaign } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignService.insert({ company, campaign })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset } = req.query
    const { id } = req.params
    const records = await campaignService.getAllForCompany(limit, offset, id)
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
      [campaignService.manyRecords()]: records.rows
    })
  }

  async getAllCampaignOrders (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search, filter }, params: { id: campaignId, jfsku } } = req

    const records = await campaignService.getAllCampaignOrders(limit, offset, campaignId, search, filter, jfsku)
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
      orders: records.rows
    })
  }
}

export default new CampaignController(campaignService)
