import BaseService from './BaseService'
import db from '../models'
import type { Module, Role } from '../types'

class PrivacyRuleService extends BaseService {
  async find (companyId: string, role: Role, module: Module): Promise<any> {
    const record = await db[this.model].findOne({
      where: {
        companyId,
        role,
        module,
        isEnabled: true
      },
      paranoid: true
    })

    return record
  }
}

export default PrivacyRuleService
