import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductStockNotificationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { product, productStockNotification } = data

    let response: any

    response = await db[this.model].findOne({
      where: {
        productId: product.id,
        threshold: productStockNotification.threshold
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productStockNotification })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productStockNotification, id: uuidv1(), productId: product.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAllProductStockNotifications (limit: number, offset: number, productId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        productId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductStockNotificationService
