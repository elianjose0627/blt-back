import BaseController from './BaseController'
import CampaignShippingDestinationService from '../services/CampaignShippingDestinationService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignShippingDestinationService = new CampaignShippingDestinationService('CampaignShippingDestination')

class CampaignOrderLimitController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignShippingDestination } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignShippingDestinationService.insert({ campaign, campaignShippingDestination })

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

export default new CampaignOrderLimitController(campaignShippingDestinationService)
