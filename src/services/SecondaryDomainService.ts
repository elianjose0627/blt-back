import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class SecondaryDomainService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, secondaryDomain } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: secondaryDomain.name,
        companyId: company.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...secondaryDomain })
      return { response: updatedResponse.toJSONFor(company), status: 200 }
    }

    response = await db[this.model].create({ ...secondaryDomain, id: uuidv1(), companyId: company.id })

    return { response: response.toJSONFor(company), status: 201 }
  }
}

export default SecondaryDomainService
