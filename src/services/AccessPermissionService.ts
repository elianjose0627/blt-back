import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

function generateFilterQuery (filter: object): object {
  const filterQuery: Record<string, unknown> = {}

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterQuery[key] = {
        [Op.eq]: value
      }
    }
  })

  return filterQuery
}
class AccessPermissionService extends BaseService {
  async insert (data: any): Promise<any> {
    const { accessPermission, company } = data
    let response: any

    const companyId = company.id

    response = await db[this.model].findOne({
      where: {
        module: accessPermission.module,
        role: accessPermission.role,
        companyId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...accessPermission })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...accessPermission, id: uuidv1(), companyId })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number, search: string = '', filter = { companyId: '' }): Promise<any> {
    const where = generateFilterQuery(filter)
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['companyId', 'DESC'], ['role', 'ASC'], ['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where,
      include: [
        {
          model: db.Company,
          attributes: ['id', 'customerId', 'name', 'email', 'phone', 'vat', 'domain'],
          as: 'company'
        }
      ]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        companyId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default AccessPermissionService
