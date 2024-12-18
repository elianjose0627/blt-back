import BaseController from './BaseController'
import CampaignQuotaService from '../services/CampaignQuotaService'
import type { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignQuotaService = new CampaignQuotaService('CampaignQuota')

class CampaignQuotaController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign,user,  body: { campaignQuota } } = req
    const userId = user.id

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const response = await campaignQuotaService.insert({ campaign, campaignQuota, userId })

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [this.recordName()]: response
    })
  }

  async update (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, user, body: { campaignQuota } } = req
    const userId = user.id

    const response = await campaignQuotaService.update({ campaign, campaignQuota, userId })

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.recordName()]: response
    })
  }

  async getAllCampaignQuotas (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, offset, page }, params: { id: campaignId } } = req

    const records = await campaignQuotaService.getAllCampaignQuotas(limit, offset, campaignId)

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
      [campaignQuotaService.manyRecords()]: records.rows,
      totalQuota: records.totalQuota
    })
  }
}

export default new CampaignQuotaController(campaignQuotaService)
