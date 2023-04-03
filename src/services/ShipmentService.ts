import db from '../models'
import BaseService from './BaseService'

class ShipmentService extends BaseService {
  async get (trackingId: string): Promise<any> {
    const record = await db[this.model].findOne({
      where: {
        trackingId
      },
      paranoid: false
    })

    return record
  }
}

export default ShipmentService
