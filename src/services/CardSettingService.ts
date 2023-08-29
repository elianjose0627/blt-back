import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CardSettingService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, cardSetting } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        campaignId: campaign.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...cardSetting })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...cardSetting, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default CardSettingService
