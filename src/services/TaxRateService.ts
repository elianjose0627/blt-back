import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class TaxRateService extends BaseService {
  recordName (): string {
    return 'Tax Rate'
  }

  async insert (data: any): Promise<any> {
    const { taxRate } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        publicId: taxRate.publicId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...taxRate })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...taxRate, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default TaxRateService
