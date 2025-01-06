import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'
class ProductGraduatedPriceService extends BaseService {
  recordName (): string {
    return 'Product Graduated Price'
  }

  async insert (data: any): Promise<any> {
    const { productGraduatedPrice, product } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        firstUnit: productGraduatedPrice.firstUnit,
        lastUnit: productGraduatedPrice.lastUnit,
        productId: product.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productGraduatedPrice })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productGraduatedPrice, productId: product.id, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }

  async insertMultiple (data: any): Promise<any> {
    const { childrenIds, productGraduatedPrices } = data
    childrenIds.forEach((childId: string) => {
      productGraduatedPrices.forEach(async (productGraduatedPrice: any) => {
        const findResponse = await db[this.model].findOne({
          where: {
            firstUnit: productGraduatedPrice.firstUnit,
            lastUnit: productGraduatedPrice.lastUnit,
            productId: childId
          },
          paranoid: false
        })
        if (findResponse !== null) {
          await findResponse.restore()
          await findResponse.update({ price: productGraduatedPrice.price })
        } else {
          await db[this.model].create({ firstUnit: productGraduatedPrice.firstUnit, lastUnit: productGraduatedPrice.lastUnit, price: productGraduatedPrice.price, productId: childId, id: uuidv1() })
        }
      })
    })
    return { status: 200 }
  }
}

export default ProductGraduatedPriceService
