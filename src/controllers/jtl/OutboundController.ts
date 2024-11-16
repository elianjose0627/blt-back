import BaseController from '../BaseController'
import OutboundService from '../../services/jtl/OutboundService'
import * as statusCodes from '../../constants/statusCodes'
import type { CustomRequest, CustomResponse } from '../../types'

const outboundService = new OutboundService('Outbound')

class OutboundController extends BaseController {
  async getOutbound (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id } } = req
    const outbound = await outboundService.getOutbound(id)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      outbound
    })
  }

  async getShippingNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id } } = req
    const shippingNotifications = await outboundService.getShippingNotifications(id)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      shippingNotifications
    })
  }
}

export default new OutboundController(outboundService)
