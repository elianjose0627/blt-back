import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import { IProductCategoryTag, IProductCategoryTagProductAccessControlGroup } from '../types'

class ProductCategoryTagProductAccessControlGroupService extends BaseService {
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
    const foundProductCategoryTagProductAccessControlGroups = await db[this.model].findAndCountAll({
      where: {
        productAccessControlGroupId,
        productCategoryTagId: foundProductCategoryTagIds
      },
      paranoid: false // To get soft deleted record
    })

    const newProductCategoryTagIds = foundProductCategoryTagIds
      .filter((productCategorytagId: string) => foundProductCategoryTagProductAccessControlGroups.rows
        .map((row: IProductCategoryTagProductAccessControlGroup) => row.productCategoryTagId)
        .includes(productCategorytagId) === false)
    const existingProductCategoryTagIds = foundProductCategoryTagIds
      .filter((productCategorytagId: string) => foundProductCategoryTagProductAccessControlGroups.rows
        .map((row: IProductCategoryTagProductAccessControlGroup) => row.productCategoryTagId)
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
}

export default ProductCategoryTagProductAccessControlGroupService
