import BaseController from './BaseController'
import CampaignAdditionalProductSettingService from '../services/CampaignAdditionalProductSettingService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as userRoles from '../utils/userRoles'
import * as statusCodes from '../constants/statusCodes'

const campaignAdditionalProductSettingService = new CampaignAdditionalProductSettingService('CampaignAdditionalProductSetting')

class CampaignAdditionalProductSettingController extends BaseController {
  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId } } = req

    const isOwnerOrAdmin = currentUser.role === userRoles.ADMIN
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

  async delete (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { settingId } } = req

    const response = await campaignAdditionalProductSettingService.delete(settingId)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} deleted` })

    return res.status(statusCodes.NOT_FOUND).send({
      statusCode: statusCodes.NOT_FOUND,
      success: true,
      [this.service.singleRecord()]: response
    })
  }
}

export default new CampaignAdditionalProductSettingController(campaignAdditionalProductSettingService)
