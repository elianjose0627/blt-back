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

  async getAllCompaniesInProductAccessControlGroup (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search }, params: { id } } = req
    const records = await companyInProductAccessControlGroupService.getAllCompaniesInProductAccessControlGroup(limit, offset, id, search)
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
      [companyInProductAccessControlGroupService.manyRecords()]: records.rows
    })
  }
}

export default new CompanyInProductAccessControlGroupController(companyInProductAccessControlGroupService)
