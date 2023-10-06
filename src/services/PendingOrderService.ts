import { v1 as uuidv1 } from 'uuid'
import utc from 'dayjs/plugin/utc'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import dayjs from 'dayjs'
import triggerPubSub from '../utils/triggerPubSub'
import * as userRoles from '../utils/userRoles'
import * as statusCodes from '../constants/statusCodes'
import { IPendingOrder } from '../types'

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

  async duplicate (data: any): Promise<any> {
    const { postedOrderIds, currentUser } = data
    const { role } = currentUser
    const allowedRoles = [userRoles.ADMIN, userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR]
    const foundPendingOrders = await db.PendingOrder.findAndCountAll({
      where: {
        postedOrderId: postedOrderIds
      },
      attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'postedOrderId', 'isPosted', 'isGreetingCardSent'] },
      raw: true
    })

    if (!allowedRoles.includes(role)) {
      return {
        message: 'Only admin, company admin or campaign manager can perform this action',
        statusCode: statusCodes.FORBIDDEN
      }
    }

    if (foundPendingOrders.count === 0) {
      return {
        message: 'Pending orders not found',
        statusCode: statusCodes.NOT_FOUND
      }
    }

    const isEmployee = foundPendingOrders.rows.every((foundPendingOrder: IPendingOrder) => foundPendingOrder.companyId === currentUser.companyId)
    if (role !== userRoles.ADMIN && isEmployee === false) {
      return {
        message: 'All orders must belong to the same company as the user',
        statusCode: statusCodes.FORBIDDEN
      }
    }

    const bulkInsertData = foundPendingOrders.rows.map((pendingOrder: any) => ({
      ...pendingOrder,
      id: uuidv1(),
      shipped: dayjs.utc().add(3, 'days').add(1, 'hour').format(),
      deliverydate: dayjs.utc().add(3, 'days').add(1, 'hour').format(),
      userId: currentUser.id,
      created: dayjs.utc().format(),
      createdBy: currentUser.email,
      updatedBy: currentUser.email,
      createdByFullName: `${String(currentUser.firstName)} ${String(currentUser.lastName)}`
    }))

    const topicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const attributes = { environment }

    await triggerPubSub(topicId, 'postPendingOrders', attributes)

    const response = await db.PendingOrder.bulkCreate(bulkInsertData, { returning: true })

    return response
  }
}

export default PendingOrderService
