import BaseController from './BaseController'
import UserInCompanyUserGroupService from '../services/UserInCompanyUserGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const userInCompanyUserGroupService = new UserInCompanyUserGroupService('UserCompanyUserGroup')

class UserInCompanyUserGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { userCompanyUserGroup: { userIds } }, params: { id } } = req

    const { response, status } = await userInCompanyUserGroupService.insert({
      userIds,
      companyUserGroupId: id
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

export default new UserInCompanyUserGroupController(userInCompanyUserGroupService)
