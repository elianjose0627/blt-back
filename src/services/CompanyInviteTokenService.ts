import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class CompanyInviteTokenService extends BaseService {
  async insert (data: any): Promise<any> {
    const { inviteToken, role, companyId } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        companyId,
        role
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ role, inviteToken })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ role, id: uuidv1(), companyId, inviteToken })

    return { response, status: 201 }
  }
}

export default CompanyInviteTokenService
