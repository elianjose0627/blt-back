import { v1 as uuidv1 } from 'uuid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import triggerPubSub from '../utils/triggerPubSub'
import * as userRoles from '../utils/userRoles'
import * as statusCodes from '../constants/statusCodes'
import { IDuplicatePostedOrder, IPendingOrder, IUserExtended } from '../types'
import { Platform } from '../enums/platform'

dayjs.extend(utc)

class PendingOrderService extends BaseService {
  async findPendingOrders (userId: string, campaignId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      distinct: true,
      where: {
        userId,
        campaignId
      }
    })

    return records
  }

  async getAll (limit: number, offset: number, search: string = '', filter = { firstname: '', lastname: '', email: '', city: '', country: '' }): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      include: generateInclude(this.model),
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['deletedAt'] }
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

    const pendingOrdersTopicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const pendingOrdersAttributes = { environment }

    await triggerPubSub(pendingOrdersTopicId, 'postPendingOrders', pendingOrdersAttributes)

    // Recalculate Quota
    const quotaTopicId = 'campaign-quota'
    const campaignId = campaign.id
    const attributes = { campaignId, environment }

    await triggerPubSub(quotaTopicId, 'updateCorrectionQuotaPerCampaign', attributes)

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }

  async insertCataloguePendingOrders (data: any): Promise<any> {
    const { pendingOrders, currentUser } = data
    const { company } = currentUser

    const bulkInsertData = pendingOrders.map((pendingOrder: any) => ({
      ...pendingOrder,
      id: uuidv1(),
      platform: Platform.None,
      userId: currentUser.id,
      campaignId: null,
      customerId: company?.customerId ?? 0,
      companyId: company?.id,
      created: dayjs.utc().format(),
      createdBy: currentUser.email,
      updatedBy: currentUser.email,
      createdByFullName: `${String(currentUser.firstName)} ${String(currentUser.lastName)}`
    }))

    const response = await db.PendingOrder.bulkCreate(bulkInsertData, { returning: true })

    const pendingOrdersTopicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const pendingOrdersAttributes = { environment }

    await triggerPubSub(pendingOrdersTopicId, 'postPendingOrders', pendingOrdersAttributes)

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }

  async duplicate (data: any): Promise<any> {
    const { postedOrders, currentUser }: { postedOrders: IDuplicatePostedOrder[], currentUser: IUserExtended } = data
    const { role } = currentUser
    const allowedRoles = [userRoles.ADMIN, userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR]

    const postedOrderIds = postedOrders.map((postedOrder) => postedOrder.orderId)
    const foundPendingOrders = await db.PendingOrder.findAndCountAll({
      where: {
        postedOrderId: postedOrderIds
      },
      attributes: { exclude: ['deletedAt', 'createdAt', 'updatedAt', 'isPosted', 'isGreetingCardSent'] },
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

    const bulkInsertData = foundPendingOrders.rows.map((pendingOrder: any) => {
      const [foundPostedOrderShipped] = postedOrders
        .filter((postedOrder) => postedOrder.orderId === pendingOrder.postedOrderId)
        .map((postedOrder) => postedOrder.shipped)

      const shipped = dayjs(foundPostedOrderShipped).utc().add(1, 'hour').format()
      return ({
        ...pendingOrder,
        id: uuidv1(),
        shipped,
        deliverydate: shipped,
        userId: currentUser.id,
        created: dayjs.utc().format(),
        createdBy: currentUser.email,
        updatedBy: currentUser.email,
        createdByFullName: `${String(currentUser.firstName)} ${String(currentUser.lastName)}`,
        postedOrderId: null
      })
    })

    const topicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const attributes = { environment }

    const response = await db.PendingOrder.bulkCreate(bulkInsertData, { returning: true })

    const campaignIds: Set<string> = new Set(response.map((data: any) => data.campaignId))

    const promises = Array.from(campaignIds).map(async (campaignId) => {
      // Recalculate Quota
      const quotaTopicId = 'campaign-quota'
      const campaignAttributes = { campaignId, environment }
      await triggerPubSub(quotaTopicId, 'updateCorrectionQuotaPerCampaign', campaignAttributes)
    })
    await Promise.all(promises)

    await triggerPubSub(topicId, 'postPendingOrders', attributes)

    return response
  }
}

export default PendingOrderService
