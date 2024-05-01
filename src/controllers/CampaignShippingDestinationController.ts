import BaseController from './BaseController'
import CampaignShippingDestinationService from '../services/CampaignShippingDestinationService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignShippingDestinationService = new CampaignShippingDestinationService('CampaignShippingDestination')

class CampaignShippingDestinationController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignShippingDestinations } } = req

    io.emit(`${String(campaignShippingDestinationService.manyRecords())}`, { message: `${String(campaignShippingDestinationService.manyRecords())} created` })

    const { response, status } = await campaignShippingDestinationService.insert({ campaign, campaignShippingDestinations })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [campaignShippingDestinationService.manyRecords()]: response
    })
  }
}

export default new CampaignShippingDestinationController(campaignShippingDestinationService)
