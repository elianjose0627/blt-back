import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class SalutationService extends BaseService {
  async insert (data: any): Promise<any> {
    const { salutation } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        title: salutation.title
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...salutation })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...salutation, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default SalutationService
