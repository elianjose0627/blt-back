import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'
import * as userRoles from '../utils/userRoles'

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
        name: productCategory.name,
        companyId: productCategory.companyId
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

  async getAll (limit: number, offset: number, search?: string, filter?: any, user?: any): Promise<any> {
    let where
    const whereFilterIsHidden = filter?.isHidden !== undefined ? { isHidden: filter.isHidden === 'true' } : {}
    const whereCompanyId = user.role === userRoles.ADMIN
      ? {}
      : {
          companyId: user.company === null
            ? null
            : user.company.defaultProductCategoriesHidden === false
              ? {
                  [Op.or]: [
                    { [Op.is]: null },
                    { [Op.eq]: user.company.id }
                  ]
                }
              : user.company.id
        }

    if (search !== undefined) {
      where = {
        name: { [Op.iLike]: `%${search}%` }
      }
    }
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      where: {
        ...where,
        ...whereFilterIsHidden,
        ...whereCompanyId
      },
      include: [
        {
          model: db.ProductCategoryTag,
          attributes: ['id', 'name', 'type'],
          as: 'productCategoryTags',
          where: {
            type: 'category'
          },
          required: false
        },
        {
          model: db.Company,
          attributes: ['id', 'name'],
          as: 'company',
          required: false
        }
      ],
      order: [['companyId', 'DESC'], ['sortIndex', 'ASC'], ['createdAt', 'DESC']],
      attributes: { exclude: [] },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async updateSortOrder (data: { productCategories: Array<{ productCategoryId: string, sortIndex: number }> }): Promise<any> {
    const { productCategories } = data

    const updatePromises = productCategories.map(productCategory =>
      db[this.model].update(
        { sortIndex: productCategory.sortIndex },
        { where: { id: productCategory.productCategoryId, companyId: null } }
      )
    )

    const response = await Promise.all(updatePromises)
    return response
  }

  async getAllForCompany (limit: number, offset: number, companyId: string, defaultProductCategoriesHidden: boolean, search?: string, filter?: any): Promise<any> {
    let where
    const whereFilterIsHidden = filter?.isHidden !== undefined ? { isHidden: filter.isHidden === 'true' } : {}

    if (search !== undefined) {
      where = {
        name: { [Op.iLike]: `%${search}%` }
      }
    }

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      where: {
        ...where,
        ...whereFilterIsHidden,
        [Op.or]: [
          { companyId },
          ...(defaultProductCategoriesHidden ? [] : [{ companyId: null }])
        ]
      },
      include: [
        {
          model: db.ProductCategoryTag,
          attributes: ['id', 'name', 'type'],
          as: 'productCategoryTags',
          where: {
            type: 'category'
          },
          required: false
        }
      ],
      order: [['sortIndex', 'ASC'], ['createdAt', 'DESC']],
      attributes: { exclude: [] },
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductCategoryService
