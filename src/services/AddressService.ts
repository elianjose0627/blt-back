import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class AddressService extends BaseService {
  manyRecords (): string {
    return 'addresses'
  }

  async insert (data: any): Promise<any> {
    const { user, company, address } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        [Op.or]: [
          { companyId: company?.id },
          { userId: user?.id }
        ]
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...address })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    if (company !== null) {
      response = await db[this.model].create({ ...address, id: uuidv1(), companyId: company?.id })
    } else {
      response = await db[this.model].create({ ...address, id: uuidv1(), userId: user?.id })
    }

    return { response: response.toJSONFor(user), status: 201 }
  }
}

export default AddressService
