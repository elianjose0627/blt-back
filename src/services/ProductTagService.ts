import { v1 as uuidv1 } from 'uuid'
import { Op, QueryTypes } from 'sequelize'
import BaseService from './BaseService'
import db, { sequelizeInstance } from '../models'

class ProductTagService extends BaseService {
  recordName (): string {
    return 'Product Tag'
  }

  async insert (data: any): Promise<any> {
    const { productCategoryTags, product } = data
    let response: any

    const foundProductTagsResponse = await db[this.model].findAndCountAll({
      where: {
        productCategoryTagId: {
          [Op.in]: productCategoryTags.map((tag: any) => tag.id)
        },
        productId: product.id
      },
      paranoid: false // To get soft deleted record
    })

    const newProductCategoryTags = productCategoryTags.filter((tag: any) => foundProductTagsResponse.rows.map((row: any) => row.productCategoryTagId).includes(tag.id) === false)
    const existingProductCategoryTags = productCategoryTags.filter((tag: any) => foundProductTagsResponse.rows.map((row: any) => row.productCategoryTagId).includes(tag.id))
    const productTagsToDelete = product.productTags.filter((productTag: any) => productCategoryTags.map((tag: any) => tag.id).includes(productTag.productCategoryTag.id) === false)

    if (productTagsToDelete.length > 0) {
      await db[this.model].destroy({
        force: true,
        where: {
          id: {
            [Op.in]: productTagsToDelete.map((tag: any) => tag.id)
          }
        }
      })
    }

    if (newProductCategoryTags.length > 0) {
      const bulkInsertData = newProductCategoryTags.map((newProductCategoryTag: any) => ({
        id: uuidv1(),
        productCategoryTagId: newProductCategoryTag.id,
        productId: product.id
      }))

      response = await db[this.model].bulkCreate(bulkInsertData, { returning: true })
    }

    if (existingProductCategoryTags.length > 0) {
      const updatedResponse = await db[this.model].restore({
        where: {
          id: {
            [Op.in]: foundProductTagsResponse.rows.map((tag: any) => tag.id)
          }
        },
        returning: true
      })
      return { response: updatedResponse.map((response: any) => response.toJSONFor()), status: 200 }
    }

    if (productCategoryTags.length === 0) {
      return { response: [], status: 204 }
    }

    return { response: response.map((response: any) => response.toJSONFor()), status: 201 }
  }

  async getSimilarProducts (limit: number, offset: number, productCategoryTagIds: string[], productId: string): Promise<any> {
    const response = await sequelizeInstance.query(
      `
      SELECT DISTINCT ON ("Products".id, "Products"."productColorId")
      "Products".id,
      "Products".name,
      "Products"."merchantSku",
      "Products".pictures,
      "Products"."createdAt",
      "Products"."updatedAt"
      FROM "ProductTags"
      JOIN "Products" ON "ProductTags"."productId" = "Products".id
      WHERE "ProductTags"."productId" != :productId
        AND "ProductTags"."productCategoryTagId" IN (:productCategoryTagIds)
        AND "Products".id IN (
          SELECT "productId"
          FROM "ProductTags"
          WHERE "productCategoryTagId" IN (:productCategoryTagIds)
          GROUP BY "productId"
          HAVING COUNT(DISTINCT "productCategoryTagId") = :tagCount
        )
      ORDER BY "Products".id, "Products"."productColorId", "ProductTags"."createdAt" DESC
      LIMIT :limit OFFSET :offset;
      `,
      {
        replacements: {
          productId,
          productCategoryTagIds,
          tagCount: productCategoryTagIds.length,
          limit,
          offset
        },
        type: QueryTypes.SELECT,
        nest: true
      }
    )

    return {
      rows: response,
      count: response.length
    }
  }
}

export default ProductTagService
