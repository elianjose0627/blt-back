import { v1 as uuidv1, v4 as uuidv4 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class ApiKeyService extends BaseService {
  async insert (data: any): Promise<any> {
    const { apiKey, currentUser } = data
    const secretKey = uuidv4()

    const response = await db[this.model].create({ ...apiKey, secretKey, id: uuidv1(), userId: currentUser.id })

    return {
      ...response.toJSONFor(),
      secretKey
    }
  }

  async getAllForCurrentUser (limit: number, offset: number, userId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['secretKey'] },
      where: {
        userId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ApiKeyService
