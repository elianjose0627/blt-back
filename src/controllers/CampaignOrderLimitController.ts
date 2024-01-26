import BaseController from './BaseController'
import CampaignOrderLimitService from '../services/CampaignOrderLimitService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignOrderLimitService = new CampaignOrderLimitService('CampaignOrderLimit')

class CampaignOrderLimitController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignOrderLimit } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignOrderLimitService.insert({ campaign, campaignOrderLimit })

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
}

export default new CampaignOrderLimitController(campaignOrderLimitService)
