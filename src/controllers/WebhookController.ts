import BaseController from './BaseController'
import WebhookService from '../services/WebhookService'
import { CustomRequest, CustomResponse, SlackEvent } from '../types'
import SlackService from '../services/SlackService'
import * as statusCodes from '../constants/statusCodes'

const webhookService = new WebhookService('Webhook')

class WebhookController extends BaseController {
  async postSlackEvent (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: events } = req

    events.forEach(async (event: SlackEvent) => {
      await SlackService.postToSlackChannel({ text: `${String(event.email)} - ${String(event.event)}` })
    })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      webhook: { message: 'Webhook received and processed successfully' }
    })
  }
}

export default new WebhookController(webhookService)
