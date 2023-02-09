import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class BundleService extends BaseService {
  async insert (data: any): Promise<any> {
    const { bundle, campaign } = data
    let response: any

    const bundleData = { jfsku: bundle.jfsku, merchantSku: bundle.merchantSku, name: bundle.name }

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
      const updatedResponse = await response.update({ ...bundleData })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...bundleData, id: uuidv1(), campaignId: campaign.id })

    if (bundle?.items?.length > 0) {
      const items = bundle.items.map((item: any) => ({ id: uuidv1(), bundleId: response.id, ...item }))

      await db.BundleItem.bulkCreate(items)
    }

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number, campaignId?: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.BundleItem,
          attributes: ['id', 'name', 'jfsku', 'merchantSku', 'updatedAt', 'createdAt'],
          as: 'items'
        }
      ],
      attributes: { exclude: [] },
      where: {
        campaignId
      },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default BundleService
