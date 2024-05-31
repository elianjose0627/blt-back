import BaseController from './BaseController'
import CompanyInProductAccessControlGroupService from '../services/CompanyInProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companyInProductAccessControlGroupService = new CompanyInProductAccessControlGroupService('CompanyProductAccessControlGroup')

class CompanyInProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { companyProductAccessControlGroup: { companyIds } }, params: { id } } = req

    const { response, status } = await companyInProductAccessControlGroupService.insert({
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

export default new CompanyInProductAccessControlGroupController(companyInProductAccessControlGroupService)
