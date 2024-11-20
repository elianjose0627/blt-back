import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignQuotaService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignQuota } = data

    const response = await db[this.model].create({ ...campaignQuota, id: uuidv1(), campaignId: campaign.id })

    return response.toJSONFor()
  }

  async getAllCampaignQuotas (limit: number, offset: number, campaignId: string): Promise<any> {
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

export default CampaignQuotaService
