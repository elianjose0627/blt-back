import { v1 as uuidv1 } from 'uuid'
import utc from 'dayjs/plugin/utc'
import { PubSub } from '@google-cloud/pubsub'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import dayjs from 'dayjs'
import logger from '../utils/logger'

dayjs.extend(utc)

class PendingOrderService extends BaseService {
  async getAll (limit: number, offset: number, search: string = '', filter = { firstname: '', lastname: '', email: '', city: '', country: '' }): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      include: generateInclude(this.model),
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] }
    })

    return records
  }

  async insert (data: any): Promise<any> {
    const { pendingOrders, currentUser, campaign } = data

    const bulkInsertData = pendingOrders.map((pendingOrder: any) => ({
      ...pendingOrder,
      id: uuidv1(),
      userId: currentUser.id,
      campaignId: campaign.id,
      customerId: campaign.company.customerId,
      companyId: campaign.company.id,
      created: dayjs.utc().format(),
      createdBy: currentUser.email,
      updatedBy: currentUser.email,
      createdByFullName: `${String(currentUser.firstName)} ${String(currentUser.lastName)}`
    }))

    const response = await db.PendingOrder.bulkCreate(bulkInsertData, { returning: true })

    const topicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const message = Buffer.from(JSON.stringify({ message: `Trigger postPendingOrders for ${environment}` }))
    const attributes = { environment }

    const pubSubClient = new PubSub()

    try {
      const messageId = await pubSubClient
        .topic(topicId)
        .publishMessage({
          data: message,
          attributes
        })
      logger.info(`Message ${messageId} published.`)
    } catch (error: any) {
      logger.error(error.message)
    }

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }
}

export default PendingOrderService
