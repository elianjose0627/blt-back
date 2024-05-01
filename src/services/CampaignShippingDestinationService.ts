import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { ICampaignShippingDestination } from '../types'

class CampaignShippingDestinationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, campaignShippingDestinations } = data
    let updated = []
    let added = []

    const foundCampaignShippingDestinationsResponse = await db[this.model].findAndCountAll({
      where: {
        campaignId: campaign.id,
        country: campaignShippingDestinations
      },
      paranoid: false // To get soft deleted record
    })

    const newCampaignShippingDestinations = campaignShippingDestinations.filter((country: string) => foundCampaignShippingDestinationsResponse.rows.map((row: ICampaignShippingDestination) => row.country).includes(country) === false)
    const existingCampaignShippingDestinations = campaignShippingDestinations.filter((country: string) => foundCampaignShippingDestinationsResponse.rows.map((row: ICampaignShippingDestination) => row.country).includes(country))

    if (existingCampaignShippingDestinations.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          id: {
            [Op.in]: foundCampaignShippingDestinationsResponse.rows.map((country: ICampaignShippingDestination) => country.id)
          }
        },
        returning: true
      })
      updated = updatedResponse.map((response: any) => response.toJSONFor())
    }

    if (newCampaignShippingDestinations.length > 0) {
      const bulkInsertData = newCampaignShippingDestinations.map((country: string) => ({
        country,
        id: uuidv1(),
        campaignId: campaign.id
      }))

      const addedResponse = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
      added = addedResponse.map((response: any) => response.toJSONFor())
    }
    return { response: { updated, added }, status: 200 }
  }
}

export default CampaignShippingDestinationService
