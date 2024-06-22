import BaseController from './BaseController'
import MassUnitService from '../services/MassUnitService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import * as statusCodes from '../constants/statusCodes'

const massUnitService = new MassUnitService('MassUnit')

class MassUnitController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { massUnit } } = req

    const { response, status } = await massUnitService.insert({ massUnit })

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

export default new MassUnitController(massUnitService)
