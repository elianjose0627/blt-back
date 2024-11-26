import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignQuotaNotificationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignQuotaNotification } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id,
        threshold: campaignQuotaNotification.threshold
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaignQuotaNotification })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...campaignQuotaNotification, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAllCampaignQuotaNotifications (limit: number, offset: number, campaignId: string): Promise<any> {
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

export default CampaignQuotaNotificationService
