import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db, { sequelizeInstance } from '../models'

class BundleService extends BaseService {
  async insert (data: any): Promise<any> {
    const { bundle, campaign } = data
    let response: any

    const { jfsku = null } = bundle

    const bundleData = {
      jfsku,
      merchantSku: bundle.merchantSku,
      name: bundle.name,
      description: bundle.description,
      price: bundle.price,
      isLocked: bundle.isLocked,
      isBillOfMaterials: bundle.isBillOfMaterials,
      specifications: bundle.specifications
    }

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: bundle.name,
        campaignId: campaign.id,
        jfsku,
        merchantSku: bundle.merchantSku
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...bundleData })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await sequelizeInstance.transaction(async (t) => {
      const createdBundle = await db[this.model].create({ ...bundleData, id: uuidv1(), campaignId: campaign.id }, { transaction: t })

      return createdBundle
    })

    return { response: response.toJSONFor(), status: 201 }
  }

  async update (record: any, data: any): Promise<any> {
    const { merchantSku, name, price, description, isLocked, isBillOfMaterials, specifications } = data

    // TODO: skip update of items when isLocked is true

    const updatedRecord = await sequelizeInstance.transaction(async (t) => {
      const updatedBundle = await record.update({
        merchantSku,
        name,
        price,
        description,
        isLocked,
        isBillOfMaterials,
        specifications
      }, { transaction: t })

      return updatedBundle
    })

    return updatedRecord.toJSONFor()
  }

  async getAll (limit: number, offset: number, campaignId?: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.Picture,
          attributes: ['id', 'filename', 'url', 'size', 'mimeType', 'updatedAt', 'createdAt'],
          as: 'pictures'
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
