import BaseController from './BaseController'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import SecondaryDomainService from '../services/SecondaryDomainService'
import * as statusCodes from '../constants/statusCodes'

const secondaryDomainService = new SecondaryDomainService('SecondaryDomain')

class SecondaryDomainController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { secondaryDomain } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await secondaryDomainService.insert({ company, secondaryDomain })

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

export default new SecondaryDomainController(secondaryDomainService)
