import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignOrderLimitService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignOrderLimit } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id,
        role: campaignOrderLimit.role
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaignOrderLimit })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...campaignOrderLimit, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default CampaignOrderLimitService
