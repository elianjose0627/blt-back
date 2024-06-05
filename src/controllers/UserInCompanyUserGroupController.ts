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

  async getAllInCompanyUserGroup (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search }, params: { id } } = req
    const records = await userInCompanyUserGroupService.getAllInCompanyUserGroup(limit, offset, id, search)
    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [userInCompanyUserGroupService.manyRecords()]: records.rows
    })
  }
}

export default new UserInCompanyUserGroupController(userInCompanyUserGroupService)
