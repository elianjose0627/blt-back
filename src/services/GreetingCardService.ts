import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateFilterQuery } from './BaseService'
import db from '../models'

class GreetingCardService extends BaseService {
  async insert (data: any): Promise<any> {
    const { greetingCard } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        articleNumber: greetingCard.articleNumber,
        articleName: greetingCard.articleName,
        jtlfpid: greetingCard.jtlfpid
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...greetingCard })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...greetingCard, id: uuidv1() })

    return { response, status: 201 }
  }

  async getAll (limit: number, offset: number, search = '', filter = { companyId: '' }): Promise<any> {
    let where = generateFilterQuery(filter)
    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { articleName: { [Op.iLike]: `%${search}%` } },
              { jtlfpid: { [Op.iLike]: `%${search}%` } },
              { articleNumber: { [Op.iLike]: `%${search}%` } }
            ]
          },
          where
        ]
      }
    }
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      where,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default GreetingCardService
