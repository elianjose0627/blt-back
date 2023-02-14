import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import compareArrays from '../utils/compareArrays'
import { IBundleItem } from '../types'
import { PubSub } from '@google-cloud/pubsub'

class BundleService extends BaseService {
  async insert (data: any): Promise<any> {
    const { bundle, campaign } = data
    let response: any

    const bundleData = {
      jfsku: bundle.jfsku,
      merchantSku: bundle.merchantSku,
      name: bundle.name,
      description: bundle.description,
      price: bundle.price
    }

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: bundle.name,
        campaignId: campaign.id,
        jfsku: bundle.jfsku,
        merchantSku: bundle.merchantSku
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      const itemsArrayResponse = response.items.map((item: any) => ({
        name: item.name,
        jfsku: item.jfsku,
        merchantSku: item.merchantSku
      }))

      if (compareArrays(bundle?.items ?? [], itemsArrayResponse)) {
        await response.restore()
        const updatedResponse = await response.update({ ...bundleData })
        return { response: updatedResponse.toJSONFor(), status: 200 }
      }
    }

    response = await db[this.model].create({ ...bundleData, id: uuidv1(), campaignId: campaign.id })

    if (bundle?.items?.length > 0) {
      const items: any[] = []
      bundle.items
        .map((item: any) => ({ bundleId: response.id, ...item }))
        .forEach((item: any) => {
          item.id = uuidv1()
          items.push(item)
        })

      await db.BundleItem.bulkCreate(items)
    }

    // Send to pub sub
    const product = {
      name: bundle.name,
      merchantSku: response.id,
      productGroup: null,
      originCountry: 'DE',
      manufacturer: null,
      note: null,
      identifier: {
        mpn: null,
        ean: null,
        isbn: null,
        upc: null,
        asin: null
      },
      specifications: {
        unNumber: null,
        hazardIdentifier: null,
        taric: null,
        fnsku: null,
        isBatch: false,
        isDivisible: false,
        isBestBefore: false,
        isSerialNumber: false,
        isBillOfMaterials: true,
        billOfMaterialsComponents: bundle?.items?.length > 0 ? bundle.items.map((item: IBundleItem) => ({ jfsku: item.jfsku, quantity: 1 })) : null
      },
      dimensions: null,
      attributes: [
        {
          key: 'campaignId',
          value: campaign.id,
          attributeType: 'String'
        }
      ],
      netRetailPrice: {
        amount: bundle.price,
        currency: 'USD'
      },
      bundles: null,
      condition: 'Default'
    }

    // Instantiates a client
    const pubSubClient = new PubSub()

    const topicId = String(process.env.PUB_SUB_TOPIC_ID)
    // Send a message to the topic
    const message = Buffer.from(JSON.stringify(product))
    const attributes = { kind: 'post' }
    try {
      await pubSubClient
        .topic(topicId)
        .publishMessage({
          data: message,
          attributes
        })
    } catch (error) {

    }

    return { response: response.toJSONFor(), status: 201 }
  }

  async update (record: any, data: any): Promise<any> {
    const { jfsku, merchantSku, name, price, description } = data

    if (data?.items?.length > 0) {
      data.items.forEach((item: IBundleItem) => {
        const found = record.items.find((element: IBundleItem) => element.jfsku === item.jfsku && element.name === item.name && element.merchantSku === item.merchantSku)

        if (found === undefined) {
          db.BundleItem.create({ ...item, id: uuidv1(), bundleId: record.id })
        }
      })
    }

    if (data?.items?.length < record.items.length) {
      record.items.forEach((item: IBundleItem) => {
        const found = data.items.find((element: IBundleItem) => element.jfsku === item.jfsku && element.name === item.name && element.merchantSku === item.merchantSku)

        if (found === undefined) {
          db.BundleItem.destroy({
            where: {
              id: item.id
            },
            force: true
          })
        }
      })
    }

    const updatedRecord = await record.update({ jfsku, merchantSku, name, price, description })

    return updatedRecord.toJSONFor()
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
