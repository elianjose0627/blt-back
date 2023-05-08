import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

function generateFilterQuery (filter: object): any {
  const filterQuery: Record<string, unknown> = {}

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      filterQuery[`${key}`] = {
        [Op.eq]: `${String(value)}`
      }
    }
  })

  return filterQuery
}

class LegalTextService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, legalText } = data

    const response = await db[this.model].create({ ...legalText, id: uuidv1(), companyId: company?.id })

    return response.toJSONFor(company)
  }

  async getAll (limit: number, offset: number, filter = { type: '' }): Promise<any> {
    const where = generateFilterQuery(filter)

    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        ...where,
        companyId: null
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string, filter = { type: '' }): Promise<any> {
    const where = generateFilterQuery(filter)
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        ...where,
        companyId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default LegalTextService
