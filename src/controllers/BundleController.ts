import BaseController from './BaseController'
import BundleService from '../services/BundleService'
import { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const bundleService = new BundleService('Bundle')

class BundleController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { bundle } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await bundleService.insert({ bundle, campaign })

    const statusCode = {
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

export default new BundleController(bundleService)
