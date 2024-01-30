import { v1 as uuidv1 } from 'uuid'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class EmailTemplateService extends BaseService {
  async insert (data: any): Promise<any> {
    const { emailTemplate } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        emailTemplateTypeId: emailTemplate.emailTemplateTypeId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...emailTemplate })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...emailTemplate, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      include: generateInclude(this.model),
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default EmailTemplateService
