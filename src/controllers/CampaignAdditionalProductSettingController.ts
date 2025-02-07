import BaseController from './BaseController'
import CampaignAdditionalProductSettingService from '../services/CampaignAdditionalProductSettingService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const campaignAdditionalProductSettingService = new CampaignAdditionalProductSettingService('CampaignAdditionalProductSetting')

class CampaignAdditionalProductSettingController extends BaseController {
  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { campaign: { company: { id: companyId, owner } } } } = req

    const isOwnerOrAdmin = currentUser.id === owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee)) {
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
    const { record: campaign, body: { campaignAdditionalProductSetting } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignAdditionalProductSettingService.insert({ campaign, campaignAdditionalProductSetting })

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

  async getAllCampaignAdditionalProductSettings (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, offset, page }, params: { id: campaignId } } = req

    const records = await campaignAdditionalProductSettingService.getAllCampaignAdditionalProductSettings(limit, offset, campaignId)

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
      [campaignAdditionalProductSettingService.manyRecords()]: records.rows
    })
  }
}

export default new CampaignAdditionalProductSettingController(campaignAdditionalProductSettingService)
