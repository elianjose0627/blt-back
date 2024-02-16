import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'
import { Op } from 'sequelize'
import { IAddress } from '../types'

class CampaignAddressService extends BaseService {
  manyRecords (): string {
    return 'campaignAddresses'
  }

  async insert (data: any): Promise<any> {
    const { campaign, campaignAddresses } = data

    let response: any

    response = await db[this.model].findAndCountAll({
      where: {
        campaignId: campaign.id,
        type: {
          [Op.in]: campaignAddresses.map((campaignAddress: IAddress) => campaignAddress.type)
        }
      },
      paranoid: false // To get soft deleted record
    })

    if (response.count > 0) {
      let updatedResponse
      const updatedResponseArray = []
      for (const row of response.rows) {
        await row.restore()
        const updatedCampaignAddress = campaignAddresses.find((campaignAddress: IAddress) => campaignAddress.type === row.type)
        updatedResponse = await row.update({ ...updatedCampaignAddress })
        updatedResponseArray.push(updatedResponse)
      }
      return { response: updatedResponseArray, status: 200 }
    }

    const bulkInsertData = campaignAddresses.map((campaignAddress: any) => ({
      ...campaignAddress,
      id: uuidv1(),
      campaignId: campaign.id
    }))

    response = await db[this.model].bulkCreate(bulkInsertData, { returning: true })

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }
}

export default CampaignAddressService
