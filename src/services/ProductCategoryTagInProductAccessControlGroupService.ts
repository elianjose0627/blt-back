import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { IProductCategoryTag, IProductCategoryTagInProductAccessControlGroup } from '../types'

class ProductCategoryTagInProductAccessControlGroupService extends BaseService {
  recordName (): string {
    return 'Product Category Tag in Product Access Control Group'
  }

  manyRecords (): string {
    return 'productAccessControlGroupProductCategoryTags'
  }

  async insert (data: any): Promise<any> {
    const { productCategoryTagIds, productAccessControlGroupId } = data
    let updated = []
    let added = []

    const foundProductCategoryTags = await db.ProductCategoryTag.findAndCountAll({
      where: {
        id: productCategoryTagIds
      }
    })

    const foundProductCategoryTagIds = foundProductCategoryTags.rows.map((tag: IProductCategoryTag) => tag.id)
    const foundProductCategoryTagInProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        productCategoryTagId: foundProductCategoryTagIds
      },
      paranoid: false // To get soft deleted record
    })

    const newProductCategoryTagIds = foundProductCategoryTagIds
      .filter((productCategorytagId: string) => foundProductCategoryTagInProductAccessControlGroups.rows
        .map((row: IProductCategoryTagInProductAccessControlGroup) => row.productCategoryTagId)
        .includes(productCategorytagId) === false)
    const existingProductCategoryTagIds = foundProductCategoryTagIds
      .filter((productCategorytagId: string) => foundProductCategoryTagInProductAccessControlGroups.rows
        .map((row: IProductCategoryTagInProductAccessControlGroup) => row.productCategoryTagId)
        .includes(productCategorytagId))

    if (existingProductCategoryTagIds.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          productCategoryTagId: {
            [Op.in]: foundProductCategoryTagIds
          },
          productAccessControlGroupId
        },
        returning: true
      })
      updated = updatedResponse.map((response: any) => response.toJSONFor())
    }

    if (newProductCategoryTagIds.length > 0) {
      const bulkInsertData = newProductCategoryTagIds.map((productCategoryTagId: string) => ({
        productCategoryTagId,
        id: uuidv1(),
        productAccessControlGroupId
      }))

      const addedResponse = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
      added = addedResponse.map((response: any) => response.toJSONFor())
    }

    return { response: { updated, added }, status: 200 }
  }

  async getAllInProductAccessControlGroup (limit: number, offset: number, productAccessControlGroupId: string, search?: string): Promise<any> {
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
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        productAccessControlGroupId
      },
      include: [
        {
          model: db.ProductCategoryTag,
          as: 'productCategoryTag',
          attributes: ['id', 'name', 'type'],
          where,
          include: [
            {
              model: db.ProductCategory,
              attributes: ['id', 'name'],
              as: 'productCategory'
            }
          ]
        }
      ],
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductCategoryTagInProductAccessControlGroupService
