import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class BundleService extends BaseService {
  async insert (data: any): Promise<any> {
    const { bundle, campaign } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: bundle.name,
        campaignId: campaign.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...bundle })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...bundle, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default BundleService
