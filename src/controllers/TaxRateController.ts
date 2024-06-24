import BaseController from './BaseController'
import TaxRateService from '../services/TaxRateService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import * as statusCodes from '../constants/statusCodes'

const taxRateService = new TaxRateService('TaxRate')

class TaxRateController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { taxRate } } = req

    const { response, status } = await taxRateService.insert({ taxRate })

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

export default new TaxRateController(taxRateService)
