import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CardTemplateService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, cardTemplate } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        name: cardTemplate.name,
        description: cardTemplate.description,
        campaignId: campaign.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...cardTemplate })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...cardTemplate, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAllCampaignCardTemplates (limit: number, offset: number, campaignId: string): Promise<any> {
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

export default CardTemplateService
