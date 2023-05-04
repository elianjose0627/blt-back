import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class LegalTextService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, legalText } = data

    const response = await db[this.model].create({ ...legalText, id: uuidv1(), companyId: company.id })

    return response.toJSONFor(company)
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

export default LegalTextService
