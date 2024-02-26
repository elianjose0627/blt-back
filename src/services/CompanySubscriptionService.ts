import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BaseService from './BaseService'
import db from '../models'

dayjs.extend(utc)

class CompanySubscriptionService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, companySubscription } = data
    let response: any

    const nowEndOfDay = dayjs().utc().endOf('day').toDate()

    response = await db[this.model].findOne({
      where: {
        companyId: company.id,
        startDate: {
          [Op.lte]: nowEndOfDay
        },
        endDate: {
          [Op.gte]: nowEndOfDay
        },
        plan: {
          [Op.eq]: companySubscription.plan
        }
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      const updatedResponse = await response.update({ autoRenew: companySubscription.autoRenew })
      return { response: updatedResponse.toJSONFor(company), status: 200 }
    }

    response = await db[this.model].create({
      ...companySubscription,
      id: uuidv1(),
      companyId: company.id,
      paymentStatus: 'unpaid',
      email: company.email
    })

    return { response: response.toJSONFor(company), status: 201 }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['endDate', 'DESC']],
      attributes: { exclude: [] },
      where: {
        companyId,
        endDate: {
          [Op.gte]: dayjs().subtract(6, 'months').startOf('day').utc().toDate()
        }
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default CompanySubscriptionService
