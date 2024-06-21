import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class ProductInProductCategoryService extends BaseService {
  recordName (): string {
    return 'Product in Product Category'
  }

  manyRecords (): string {
    return 'productCategoryProducts'
  }

  async insert (data: any): Promise<any> {
    const { productIds, productCategoryId } = data
    let response: any

    const foundProductsInProductCategoryResponse = await db[this.model].findAndCountAll({
      attributes: ['id', 'productId', 'productCategoryId'],
      where: {
        productId: {
          [Op.in]: productIds
        },
        productCategoryId
      },
      paranoid: false // To get soft deleted record
    })
    const newProductIds = productIds.filter((id: string) => foundProductsInProductCategoryResponse.rows.map((row: any) => row.productId).includes(id) === false)
    const existingProductIds = productIds.filter((id: string) => foundProductsInProductCategoryResponse.rows.map((row: any) => row.productId).includes(id))

    if (newProductIds.length > 0) {
      const bulkInsertData = newProductIds.map((newProductId: string) => ({
        id: uuidv1(),
        productCategoryId,
        productId: newProductId
      }))

      response = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
    }

    if (existingProductIds.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          id: {
            [Op.in]: foundProductsInProductCategoryResponse.rows.map((row: any) => row.id)
          }
        },
        returning: true
      })
      return { response: updatedResponse.map((response: any) => response.toJSONFor()), status: 200 }
    }

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }

  async getAllProductsInProductCategory (limit: number, offset: number, productCategoryId: string, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { jfsku: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      attributes: ['id', 'createdAt'],
      where: {
        productCategoryId
      },
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: ['id', 'jfsku', 'name', 'pictures'],
          where: {
            ...where
          },
          include: [
            {
              model: db.ProductTag,
              include: [
                {
                  model: db.ProductCategoryTag,
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productCategoryId']
                  },
                  as: 'productCategoryTag'
                }
              ],
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId', 'productCategoryTagId']
              },
              as: 'productTags'
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductInProductCategoryService
