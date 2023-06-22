import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ShippingMethodService extends BaseService {
  async insert (data: any): Promise<any> {
    const { shippingMethod } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        shippingType: shippingMethod.shippingType
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...shippingMethod })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...shippingMethod, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default ShippingMethodService
