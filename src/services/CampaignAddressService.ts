import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CampaignAddressService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignAddress } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id,
        type: campaignAddress.type
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...campaignAddress })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...campaignAddress, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default CampaignAddressService
