import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ProductMaterialService extends BaseService {
  manyRecords (): string {
    return 'productMaterials'
  }

  recordName (): string {
    return 'Product Material'
  }

  async insert (data: any): Promise<any> {
    const { productMaterial } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productMaterial.name
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productMaterial })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productMaterial, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductMaterialService
