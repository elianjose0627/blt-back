import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService from './BaseService'
import db from '../models'

class SalesUnitService extends BaseService {
  recordName (): string {
    return 'Sales Unit'
  }

  async insert (data: any): Promise<any> {
    const { salesUnit } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        [Op.or]: {
          publicId: salesUnit.publicId,
          [Op.and]: {
            unit: salesUnit.unit,
            name: salesUnit.name
          }
        }
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...salesUnit })
      return { response: updatedResponse, status: 200 }
    }

    response = await db[this.model].create({ ...salesUnit, id: uuidv1() })

    return { response, status: 201 }
  }
}

export default SalesUnitService
