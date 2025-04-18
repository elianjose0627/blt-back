import { v1 as uuidv1 } from 'uuid'
import { Op, Sequelize } from 'sequelize'
import BaseService, { generateShippingAddressFilterQuery, generateInclude } from './BaseService'
import db from '../models'
import { IBundle } from '../types'
import triggerPubSub from '../utils/triggerPubSub'
import * as userRoles from '../utils/userRoles'
import * as appModules from '../utils/appModules'

class CampaignService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, campaign } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: campaign.name,
        type: campaign.type,
        companyId: company.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaign })
      return { response: updatedResponse.toJSONFor(company), status: 200 }
    }

    response = await db[this.model].create({ ...campaign, id: uuidv1(), companyId: company?.id })

    return { response: response.toJSONFor(company), status: 201 }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      include: generateInclude(this.model),
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT CAST(COALESCE(SUM("orderedQuota"), 0) AS INTEGER)
              FROM "CampaignQuotas" 
              WHERE "CampaignQuotas"."campaignId" = "Campaign"."id"
              AND "CampaignQuotas"."deletedAt" IS NULL
            )`),
            'totalOrderedQuota'
          ]
        ]
      },
      distinct: true,
      where: {
        companyId,
        isHidden: false
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAll (limit: number, offset: number, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { type: { [Op.iLike]: `%${search}%` } },
          { status: { [Op.iLike]: `%${search}%` } },
          { '$company.name$': { [Op.iLike]: `%${search}%` } } // Needs required true on company include to work
        ]
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT CAST(COALESCE(SUM("orderedQuota"), 0) AS INTEGER)
              FROM "CampaignQuotas" 
              WHERE "CampaignQuotas"."campaignId" = "Campaign"."id"
              AND "CampaignQuotas"."deletedAt" IS NULL
            )`),
            'totalOrderedQuota'
          ]
        ]
      },
      include: [
        {
          model: db.Company,
          attributes: ['id', 'name', 'suffix', 'email', 'phone', 'vat', 'domain'],
          as: 'company',
          required: true // Returns records that have matching values in both tables
        },
        {
          model: db.CardSetting,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'cardSetting'
        },
        {
          model: db.CampaignOrderLimit,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignOrderLimits'
        },
        {
          model: db.CampaignShippingDestination,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignShippingDestinations'
        },
        {
          model: db.CampaignAddress,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignAddresses'
        },
        {
          model: db.CampaignAdditionalProductSetting,
          attributes: { exclude: ['deletedAt', 'campaignId'] },
          as: 'campaignAdditionalProductSettings'
        }
      ],
      distinct: true,
      where
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async update (record: any, data: any): Promise<any> {
    const updatedRecord = await record.update(data)

    const topicId = 'quota'
    const campaignId = record.id
    const attributes = { campaignId }

    await triggerPubSub(topicId, 'updateCampaignsUsedQuota', attributes)

    return updatedRecord.toJSONFor()
  }

  // to be fixed
  async getAllCampaignOrders (limit: number, offset: number, campaignId: string, user: any, search: string, filter = { firstname: '', lastname: '', email: '', city: '', country: '' }, jfsku = ''): Promise<any> {
    let query = ''
    const bundles = await db.Bundle.findAll({
      attributes: ['jfsku'],
      where: {
        campaignId,
        jfsku: {
          [Op.ne]: null
        }
      }
    })
    const jfskus = bundles.map((bundle: Partial<IBundle>) => bundle.jfsku)

    if (jfskus.length === 0) {
      return {
        count: 0,
        rows: []
      }
    }

    let where = generateShippingAddressFilterQuery(filter)
    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { 'shippingAddress.firstname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.lastname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.email': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.company': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.city': { [Op.iLike]: `%${search}%` } }
            ]
          },
          where
        ]
      }
    }

    if (jfsku !== '') {
      query = `items::JSONB @> '[{ "jfsku": "${jfsku}" }]'`
    } else {
      query = jfskus.map((jfsku: string) => `items::JSONB @> '[{ "jfsku": "${jfsku}" }]'`).join(' OR ') as string
    }
    let records
    const allowedCompanyRoles = [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR]

    const include = [
      {
        model: db.Shipment,
        as: 'shipments',
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'orderId'] }
      }
    ]

    if (user.role === userRoles.ADMIN) {
      records = await db.Order.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          [Op.and]: [
            Sequelize.literal(`(${query})`),
            where
          ]
        },
        include,
        distinct: true
      })
    } else if (allowedCompanyRoles.includes(user.role)) {
      records = await db.Order.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          [Op.and]: [
            Sequelize.literal(`(${query})`),
            where
          ],
          companyId: user.company.id
        },
        include,
        distinct: true
      })
    } else {
      records = await db.Order.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          [Op.and]: [
            Sequelize.literal(`(${query})`),
            where
          ],
          'shippingAddress.email': user.email
        },
        include,
        distinct: true
      })
    }

    const companyId = user.company?.id
    const privacyRule = companyId !== undefined
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
      if (privacyRule !== null) {
        record.shippingAddress = {
          company: record.shippingAddress.company,
          lastname: record.shippingAddress.lastname,
          city: record.shippingAddress.city?.replace(/./g, '*'),
          email: record.shippingAddress.email?.replace(/.(?=.*@)/g, '*'),
          firstname: record.shippingAddress.firstname,
          street: record.shippingAddress.street?.replace(/./g, '*'),
          zip: record.shippingAddress.zip?.replace(/./g, '*'),
          country: record.shippingAddress.country?.replace(/./g, '*')
        }
      }
      return record.toJSONFor()
    })

    return {
      count,
      rows: records
    }
  }
}

export default CampaignService
