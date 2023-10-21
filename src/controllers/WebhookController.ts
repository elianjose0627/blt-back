import { EventWebhook, EventWebhookHeader } from '@sendgrid/eventwebhook'
import BaseController from './BaseController'
import WebhookService from '../services/WebhookService'
import type { CustomRequest, CustomResponse, SlackEvent } from '../types'
import SlackService from '../services/SlackService'
import * as statusCodes from '../constants/statusCodes'

const webhookService = new WebhookService('Webhook')

const verifyRequest = (publicKey: string, payload: string | Buffer, signature: string, timestamp: string): boolean => {
  const eventWebhook = new EventWebhook()
  const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey)
  return eventWebhook.verifySignature(ecPublicKey, payload, signature, timestamp)
}

class WebhookController extends BaseController {
  async postSlackEvent (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: events } = req

    const sendgridWebhookPublicKey = String(process.env.SENDGRID_WEBHOOK_PUBLIC_KEY)

    const signature = req.get(EventWebhookHeader.SIGNATURE()) as string
    const timestamp = req.get(EventWebhookHeader.TIMESTAMP()) as string

    const payload = JSON.stringify(events).split('},{').join('},\r\n{') + '\r\n'

    const verificationStatus = verifyRequest(sendgridWebhookPublicKey, payload, signature, timestamp)

    if (!verificationStatus) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Verification failed for the sendgrid webhook'
        }
      })
    }

    events.forEach(async (event: SlackEvent) => {
      await SlackService.postToSlackChannel({ text: `Email: ${String(event.email)} - Event: ${String(event.event)} - Reason: ${event.reason ?? ''}` })
    })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      webhook: { message: 'Webhook received and processed successfully' }
    })
  }
}

export default new WebhookController(webhookService)
