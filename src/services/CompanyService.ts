import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class CompanyService extends BaseService {
  manyRecords (): string {
    return 'companies'
  }

  async insert (data: any): Promise<any> {
    const { user, company } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: company.name,
        email: company.email,
        userId: user.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...company })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...company, id: uuidv1(), userId: user.id })

    return { response: response.toJSONFor(user), status: 201 }
  }

  async getAllUsers (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db.User.findAndCountAll({
      limit,
      offset,
      where: {
        companyId
      },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default CompanyService
