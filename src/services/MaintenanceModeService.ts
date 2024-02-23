import BaseService from './BaseService'
import db from '../models'
import dayjs from 'dayjs'
import { Op } from 'sequelize'

class MaintenanceModeService extends BaseService {
  async getAll (limit: number, offset: number): Promise<any> {
    const now = dayjs().toDate()
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['startDate', 'ASC']],
      attributes: { exclude: [] },
      where: {
        endDate: {
          [Op.gte]: now
        }
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default MaintenanceModeService
