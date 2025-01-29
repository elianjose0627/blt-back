import { v1 as uuidv1 } from 'uuid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import triggerPubSub from '../utils/triggerPubSub'
import * as userRoles from '../utils/userRoles'
import * as statusCodes from '../constants/statusCodes'
import { BillingAddressRequest, IDuplicatePostedOrder, IPendingOrder, IUserExtended, ShippingAddressRequest } from '../types'
import { Platform } from '../enums/platform'
import * as appModules from '../utils/appModules'

dayjs.extend(utc)

const where = {
  [Op.or]: [
    {
      [Op.or]: [
        { isPosted: false },
        { isQueued: false }
      ]
    },
    {
      [Op.and]: [
        { isPosted: true },
        { isQueued: true },
        { orderStatus: 0 }
      ]
    }
  ]
}

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

  async get (id: string, user?: any): Promise<any> {
    const record = await db[this.model].findOne({
      where: { id },
      include: generateInclude(this.model),
      attributes: { exclude: ['deletedAt', 'companyId', 'campaignId', 'paymentInformationRequests'] }
    })

    const companyId = user.companyId
    const privacyRule = companyId !== null
      ? await db.PrivacyRule.findOne({
        where: {
          companyId,
          role: user.role,
          isEnabled: true,
          module: appModules.ORDERS
        }
      })
      : null

    if (privacyRule !== null && record.userId !== user.id) {
      record.shippingAddressRequests = record.shippingAddressRequests.map((shippingAddressRequest: ShippingAddressRequest) => {
        return {
          ...shippingAddressRequest,
          place: shippingAddressRequest.place?.replace(/./g, '*'),
          email: shippingAddressRequest.email?.replace(/.(?=.*@)/g, '*'),
          street: shippingAddressRequest.street?.replace(/./g, '*'),
          zipCode: shippingAddressRequest.zipCode?.replace(/./g, '*'),
          country: shippingAddressRequest.country?.replace(/./g, '*')
        }
      })

      record.billingAddressRequests = record.billingAddressRequests !== null
        ? record.billingAddressRequests.map((billingAddressRequest: BillingAddressRequest) => {
          return {
            ...billingAddressRequest,
            place: billingAddressRequest.place?.replace(/./g, '*'),
            email: billingAddressRequest.email?.replace(/.(?=.*@)/g, '*'),
            street: billingAddressRequest.street?.replace(/./g, '*'),
            zipCode: billingAddressRequest.zipCode?.replace(/./g, '*'),
            country: billingAddressRequest.country?.replace(/./g, '*')
          }
        })
        : null
    }
    return record.toJSONFor()
  }

  async getAll (limit: number, offset: number, user?: any, search: string = '', filter = { firstname: '', lastname: '', email: '', city: '', country: '' }): Promise<any> {
    let records
    const exclude = ['deletedAt', 'companyId', 'campaignId', 'paymentInformationRequests']

    if (user.role === userRoles.ADMIN) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude },
        distinct: true,
        where
      })
    } else if (user.role === userRoles.COMPANYADMINISTRATOR) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude },
        where: {
          companyId: user.company.id,
          ...where
        },
        distinct: true
      })
    } else if (user.role === userRoles.CAMPAIGNMANAGER) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude },
        where: {
          companyId: user.company.id,
          ...where
        },
        distinct: true
      })
    } else {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude },
        where: {
          userId: user.id,
          ...where
        },
        distinct: true
      })
    }

    const companyId = user.companyId
    const privacyRule = companyId !== null
      ? await db.PrivacyRule.findOne({
        where: {
          companyId,
          role: user.role,
          isEnabled: true,
          module: appModules.ORDERS
        }
      })
      : null

    const count = records.count

    records = records.rows.map((record: any) => {
      if (privacyRule !== null && record.userId !== user.id) {
        record.shippingAddressRequests = record.shippingAddressRequests.map((shippingAddressRequest: ShippingAddressRequest) => {
          return {
            ...shippingAddressRequest,
            place: shippingAddressRequest.place?.replace(/./g, '*'),
            email: shippingAddressRequest.email?.replace(/.(?=.*@)/g, '*'),
            street: shippingAddressRequest.street?.replace(/./g, '*'),
            zipCode: shippingAddressRequest.zipCode?.replace(/./g, '*'),
            country: shippingAddressRequest.country?.replace(/./g, '*')
          }
        })

        record.billingAddressRequests = record.billingAddressRequests !== null
          ? record.billingAddressRequests.map((billingAddressRequest: BillingAddressRequest) => {
            return {
              ...billingAddressRequest,
              place: billingAddressRequest.place?.replace(/./g, '*'),
              email: billingAddressRequest.email?.replace(/.(?=.*@)/g, '*'),
              street: billingAddressRequest.street?.replace(/./g, '*'),
              zipCode: billingAddressRequest.zipCode?.replace(/./g, '*'),
              country: billingAddressRequest.country?.replace(/./g, '*')
            }
          })
          : null
      }
      return record.toJSONFor()
    })

    return {
      count,
      rows: records
    }
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

  async update (data: any): Promise<any> {
    const { pendingOrder, currentUser, record } = data

    const updateData = {
      ...pendingOrder,
      updatedBy: currentUser.email
    }

    const response = await record.update(updateData, { returning: true })

    const pendingOrdersTopicId = 'pending-orders'
    const environment = String(process.env.ENVIRONMENT)
    const pendingOrdersAttributes = { environment }

    await triggerPubSub(pendingOrdersTopicId, 'postPendingOrders', pendingOrdersAttributes)

    return { response: response.toJSONFor(), status: 200 }
  }

  async insertGETECPendingOrder (data: any): Promise<any> {
    const { currentUser, parsedData } = data
    const getecCampaignId = process.env.GETEC_CAMPAIGN_ID ?? null
    const bulkInsertData = parsedData.map((pendingOrder: any) => ({
      ...pendingOrder,
      id: uuidv1(),
      platform: 0,
      language: 0,
      orderStatus: 0,
      isPosted: false,
      isQueued: false,
      paymentType: 0,
      paymentTarget: 0,
      discount: 0,
      userId: currentUser.id,
      campaignId: getecCampaignId,
      customerId: currentUser.company.customerId,
      companyId: currentUser.companyId,
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
    return {
      response,
      status: 201
    }
  }
}

export default PendingOrderService
