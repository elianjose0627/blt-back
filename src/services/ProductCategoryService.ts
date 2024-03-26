import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductCategoryService extends BaseService {
  manyRecords (): string {
    return 'productCategories'
  }

  recordName (): string {
    return 'Product Category'
  }

  async insert (data: any): Promise<any> {
    const { productCategory } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productCategory.name
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productCategory })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productCategory, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductCategoryService
