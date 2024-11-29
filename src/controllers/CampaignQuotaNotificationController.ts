import BaseController from './BaseController'
import CampaignQuotaNotificationService from '../services/CampaignQuotaNotificationService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignQuotaNotificationService = new CampaignQuotaNotificationService('CampaignQuotaNotification')

class CampaignQuotaNotificationController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignQuotaNotification } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignQuotaNotificationService.insert({ campaign, campaignQuotaNotification })

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

  async getAllCampaignQuotaNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, offset, page }, params: { id: campaignId } } = req

    const records = await campaignQuotaNotificationService.getAllCampaignQuotaNotifications(limit, offset, campaignId)

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
      [campaignQuotaNotificationService.manyRecords()]: records.rows
    })
  }
}

export default new CampaignQuotaNotificationController(campaignQuotaNotificationService)
