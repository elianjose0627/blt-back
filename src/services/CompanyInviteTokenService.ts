import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'
import { ICompanyInviteToken } from '../types'

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

  async updateInviteDomainCheck (data: any): Promise<any> {
    const { companyId, roles, companyInviteTokens } = data

    const operations = Object.entries(roles).map(([key, value]) => {
      const foundCompanyInviteToken: ICompanyInviteToken = companyInviteTokens.find((companyInviteToken: ICompanyInviteToken) => companyInviteToken.role === key)
      const record = db[this.model].upsert({
        id: foundCompanyInviteToken?.id ?? uuidv1(),
        companyId,
        role: key,
        isDomainCheckEnabled: value,
        inviteToken: foundCompanyInviteToken?.inviteToken ?? companyId
      }, {
        returning: false
      })
      return record
    })

    const [[a], [b], [c]] = await Promise.all(operations)

    return [a, b, c]
  }
}

export default CompanyInviteTokenService
