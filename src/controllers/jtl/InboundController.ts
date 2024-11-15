import BaseController from '../BaseController'
import InboundService from '../../services/jtl/InboundService'
import * as statusCodes from '../../constants/statusCodes'
import type { CustomRequest, CustomResponse } from '../../types'

const inboundService = new InboundService('Inbound')

class InboundController extends BaseController {
  async getInbound (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id } } = req
    const inbound = await inboundService.getInbound(id)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      inbound
    })
  }

  async getShippingNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id } } = req
    const shippingNotifications = await inboundService.getShippingNotifications(id)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      shippingNotifications
    })
  }
}

export default new InboundController(inboundService)
