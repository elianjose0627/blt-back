import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductSizeService extends BaseService {
  manyRecords (): string {
    return 'productSizes'
  }

  recordName (): string {
    return 'Product Size'
  }

  async insert (data: any): Promise<any> {
    const { productSize } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productSize.name
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productSize })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productSize, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductSizeService
