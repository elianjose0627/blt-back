import { v1 as uuidv1 } from 'uuid'
import dayjs from 'dayjs'
import BaseService from './BaseService'
import db from '../models'
import triggerPubSub from '../utils/triggerPubSub'

class FileService extends BaseService {
  async insert (data: any): Promise<any> {
    const { currentUser, parsedData } = data
    const bulkInsertData = parsedData.map((pendingOrder: any) => ({
      ...pendingOrder,
      id: uuidv1(),
      userId: currentUser.id,
      campaignId: currentUser.campaignId,
      customerId: currentUser.company.customerId,
      companyId: currentUser.companyId,
      created: dayjs.utc().format(),
      // createdBy: currentUser.email,
      updatedBy: currentUser.email
      // createdByFullName: `${String(currentUser.firstName)} ${String(currentUser.lastName)}`
    }))

    const response = await db.PendingOrder.bulkCreate(bulkInsertData, { returning: true })

    const pendingOrdersTopicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const pendingOrdersAttributes = { environment }

    await triggerPubSub(pendingOrdersTopicId, 'postPendingOrders', pendingOrdersAttributes)
    return {
      response,
      status: 201
    }
  }
}

export default FileService
