import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class RecipientService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, recipient } = data

    const response = await db[this.model].create({ ...recipient, id: uuidv1(), campaignId: campaign?.id })

    return { response: response.toJSONFor(campaign), status: 201 }
  }

  async getAll (limit: number, offset: number, campaignId?: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        campaignId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default RecipientService
