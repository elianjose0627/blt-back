import BaseController from './BaseController'
import * as statusCodes from '../constants/statusCodes'
import { CustomRequest, CustomResponse } from '../types'
import HealthCheckService from '../services/HealthCheckService'

const healthCheckService = new HealthCheckService('CostCenter')

class HealthcheckController extends BaseController {
  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now()
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      healthcheck
    })
  }
}

export default new HealthcheckController(healthCheckService)
