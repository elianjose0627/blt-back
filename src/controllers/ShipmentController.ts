import BaseController from './BaseController'
import ShipmentService from '../services/ShipmentService'
import { CustomRequest, CustomResponse, TrackingData } from '../types'
import * as statusCodes from '../constants/statusCodes'
import DHLService from '../services/DHLService'

const shipmentService = new ShipmentService('Shipment')

class ShipmentController extends BaseController {
  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { trackingId } = req.params

    const record = await shipmentService.get(trackingId)

    if (record === null) {
      const { data }: { data: TrackingData } = await DHLService.trackDHLShipments(trackingId)
      const { shipments } = data
      const statusCode = shipments[0].status.statusCode

      const createdRecord = await shipmentService.insert({ trackingId, data: shipments, statusCode })

      return res.status(statusCodes.CREATED).send({
        statusCode: statusCodes.CREATED,
        success: true,
        [this.recordName()]: {
          id: createdRecord.id,
          trackingId,
          statusCode,
          data: shipments,
          createdAt: createdRecord.createdAt,
          updatedAt: createdRecord.updatedAt
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.recordName()]: record.toJSONFor()
    })
  }
}

export default new ShipmentController(shipmentService)
