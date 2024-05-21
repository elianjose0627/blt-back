import BaseController from './BaseController'
import CompanyUserGroupInProductAccessControlGroupService from '../services/CompanyUserGroupInProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companyUserGroupInProductAccessControlGroupService = new CompanyUserGroupInProductAccessControlGroupService('CompanyUserGroupProductAccessControlGroup')

class CompanyUserGroupInProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { companyUserGroupProductAccessControlGroup: { companyUserGroupIds } }, params: { id } } = req

    const { response, status } = await companyUserGroupInProductAccessControlGroupService.insert({
      companyUserGroupIds,
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

export default new CompanyUserGroupInProductAccessControlGroupController(companyUserGroupInProductAccessControlGroupService)
