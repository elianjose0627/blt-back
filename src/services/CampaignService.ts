import { v1 as uuidv1 } from 'uuid'
import { Op, Sequelize } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import { IBundle } from '../types'

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
      attributes: { exclude: [] },
      where: {
        companyId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      }]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAllCampaignOrders (limit: number, offset: number, campaignId: string): Promise<any> {
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

    const query = jfskus.map((jfsku: string) => `items::JSONB @> '[{ "jfsku": "${jfsku}" }]'`).join(' OR ') as string
    const records = await db.Order.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: Sequelize.literal(`(${query})`)
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default CampaignService
