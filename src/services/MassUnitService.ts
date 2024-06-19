import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class MassUnitService extends BaseService {
  recordName (): string {
    return 'Mass Unit'
  }

  async insert (data: any): Promise<any> {
    const { massUnit } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        [Op.or]: {
          publicId: massUnit.publicId,
          name: massUnit.name,
          code: massUnit.code
        }
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...massUnit })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...massUnit, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default MassUnitService
