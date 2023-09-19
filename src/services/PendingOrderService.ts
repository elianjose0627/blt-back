import { v1 as uuidv1 } from 'uuid'
import utc from 'dayjs/plugin/utc'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import dayjs from 'dayjs'
import triggerPubSub from '../utils/triggerPubSub'

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
    const attributes = { environment }

    await triggerPubSub(topicId, 'postPendingOrders', attributes)

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }
}

export default PendingOrderService
