import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignShippingDestinationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignShippingDestination } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id,
        country: campaignShippingDestination.country
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaignShippingDestination })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...campaignShippingDestination, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default CampaignShippingDestinationService
