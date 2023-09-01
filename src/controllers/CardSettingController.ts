import BaseController from './BaseController'
import CardSettingService from '../services/CardSettingService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const cardSettingService = new CardSettingService('CardSetting')

class CardSettingController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { cardSetting } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await cardSettingService.insert({ campaign, cardSetting })

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

export default new CardSettingController(cardSettingService)
