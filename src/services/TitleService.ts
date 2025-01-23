import { v1 as uuidv1 } from 'uuid'
import BaseService from './BaseService'
import db from '../models'

class TitleService extends BaseService {
  async insert (data: any): Promise<any> {
    const { title } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        name: title.name
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...title })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...title, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default TitleService
