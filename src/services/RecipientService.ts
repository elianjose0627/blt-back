import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class RecipientService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, recipient } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        companyId: company?.id,
        email: recipient?.email
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...recipient })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...recipient, id: uuidv1(), companyId: company?.id })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number, companyId?: string): Promise<any> {
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

export default RecipientService
