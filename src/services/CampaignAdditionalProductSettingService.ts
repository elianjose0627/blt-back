import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignAdditionalProductSettingService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignAdditionalProductSetting } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id,
        role: campaignAdditionalProductSetting.role
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaignAdditionalProductSetting })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...campaignAdditionalProductSetting, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAllCampaignAdditionalProductSettings (limit: number, offset: number, campaignId: string): Promise<any> {
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

  async delete (settingId: string): Promise<any> {
    const response = await db[this.model].findOne({
      where: {
        id: settingId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      const updatedResponse = await response.destroy()
      return { response: updatedResponse, status: 204 }
    }
  }
}

export default CampaignAdditionalProductSettingService
