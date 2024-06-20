import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'
import { Op } from 'sequelize'

class ProductCategoryTagService extends BaseService {
  recordName (): string {
    return 'Product Category Tag'
  }

  async insert (data: any): Promise<any> {
    const { productCategoryTag, productCategory } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productCategoryTag.name,
        productCategoryId: productCategory.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productCategoryTag })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productCategoryTag, id: uuidv1(), productCategoryId: productCategory.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { type: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      where,
      include: [
        {
          model: db.ProductCategory,
          attributes: ['id', 'name'],
          as: 'productCategory'
        }
      ],
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async searchProductCategoryTagsByIds (productCategoryTagIds: string[], productCategoryId: string): Promise<any> {
    const response = await db[this.model].findAndCountAll({
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        id: {
          [Op.in]: productCategoryTagIds
        },
        productCategoryId
      }
    })

    return response
  }

  async getTagsOfProductCategory (limit: number, offset: number, productCategoryId: string, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { type: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      where: {
        ...where,
        productCategoryId
      },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductCategoryTagService
