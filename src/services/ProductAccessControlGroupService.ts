import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class ProductAccessControlGroupService extends BaseService {
  manyRecords (): string {
    return 'productAccessControlGroups'
  }

  recordName (): string {
    return 'Product Access Control Group'
  }

  async getAll (limit: number, offset: number, search?: string): Promise<any> {
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where,
      distinct: true,
      include: [
        {
          model: db.Company,
          attributes: ['id', 'name', 'suffix', 'email', 'domain'],
          as: 'company'
        }
      ]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    const { productAccessControlGroup } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: productAccessControlGroup.name,
        companyId: productAccessControlGroup.companyId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...productAccessControlGroup })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...productAccessControlGroup, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default ProductAccessControlGroupService
