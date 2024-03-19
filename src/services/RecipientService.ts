import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import * as appModules from '../utils/appModules'

class RecipientService extends BaseService {
  async insert (data: any): Promise<any> {
    const { campaign, recipient } = data

    const response = await db[this.model].create({ ...recipient, id: uuidv1(), campaignId: campaign.id })

    return { response: response.toJSONFor(campaign), status: 201 }
  }

  async getAll (limit: number, offset: number, campaignId?: string, user?: any, search?: string): Promise<any> {
    let records

    if (search !== undefined) {
      records = await db[this.model].findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          campaignId,
          [Op.or]: [
            { email: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { companyName: { [Op.iLike]: `%${search}%` } },
            { country: { [Op.iLike]: `%${search}%` } },
            { city: { [Op.iLike]: `%${search}%` } },
            { street: { [Op.iLike]: `%${search}%` } },
            { costCenter: { [Op.iLike]: `%${search}%` } },
            { addressAddition: { [Op.iLike]: `%${search}%` } }
          ]
        }
      })
    } else {
      records = await db[this.model].findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          campaignId
        }
      })
    }

    const companyId = user.company?.id
    const privacyRule = companyId !== undefined
      ? await db.PrivacyRule.findOne({
        where: {
          companyId,
          role: user.role,
          isEnabled: true,
          module: appModules.RECIPIENTS
        }
      })
      : null

    return {
      count: records.count,
      rows: records.rows.map((record: any) => {
        if (privacyRule !== null) {
          record.city = record.city.replace(/./g, '*')
          record.street = record.street?.replace(/./g, '*') ?? null
          record.zip = record.zip?.replace(/./g, '*') ?? null
          record.addressAddition = record.addressAddition?.replace(/./g, '*') ?? null
        }
        return record.toJSONFor()
      })
    }
  }
}

export default RecipientService
