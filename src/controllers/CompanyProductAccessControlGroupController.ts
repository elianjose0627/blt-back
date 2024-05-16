import BaseController from './BaseController'
import CompanyProductAccessControlGroupService from '../services/CompanyProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companyProductAccessControlGroupService = new CompanyProductAccessControlGroupService('CompanyProductAccessControlGroup')

class CompanyProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { companyProductAccessControlGroup: { companyIds } }, params: { id } } = req

    const { response, status } = await companyProductAccessControlGroupService.insert({
      companyIds,
      productAccessControlGroupId: id
    })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

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

export default new CompanyProductAccessControlGroupController(companyProductAccessControlGroupService)
