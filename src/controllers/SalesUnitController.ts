import BaseController from './BaseController'
import SalesUnitService from '../services/SalesUnitService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import * as statusCodes from '../constants/statusCodes'

const salesUnitService = new SalesUnitService('SalesUnit')

class SalesUnitController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { salesUnit } } = req

    const { response, status } = await salesUnitService.insert({ salesUnit })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.recordName()]: response
    })
  }
}

export default new SalesUnitController(salesUnitService)
