import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductColorService extends BaseService {
  manyRecords (): string {
    return 'productColors'
  }

  recordName (): string {
    return 'Product Color'
  }

  async insert (data: any): Promise<any> {
    const { productColor } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productColor.name,
        hexCode: productColor.hexCode
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productColor })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productColor, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductColorService
