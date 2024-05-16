import BaseController from './BaseController'
import UserProductAccessControlGroupService from '../services/UserProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const userProductAccessControlGroupService = new UserProductAccessControlGroupService('UserProductAccessControlGroup')

class UserProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { userProductAccessControlGroup: { userIds } }, params: { id } } = req

    const { response, status } = await userProductAccessControlGroupService.insert({
      userIds,
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

export default new UserProductAccessControlGroupController(userProductAccessControlGroupService)
