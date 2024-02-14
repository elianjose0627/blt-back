import BaseController from './BaseController'
import CampaignAddressService from '../services/CampaignAddressService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const campaignAddressService = new CampaignAddressService('CampaignAddress')

class CampaignOrderLimitController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignAddress } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignAddressService.insert({ campaign, campaignAddress })

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

export default new CampaignOrderLimitController(campaignAddressService)
