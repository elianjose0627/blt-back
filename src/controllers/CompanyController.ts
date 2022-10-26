import BaseController from './BaseController'
import CompanyService from '../services/CompanyService'
import { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companyService = new CompanyService('Company')

class CompanyController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { company } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await companyService.insert({ user, company })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      company: response
    })
  }

  async getAllUsers (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id: companyId } } = req
    const records = await companyService.getAllUsers(limit, offset, companyId)
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
      users: records.rows
    })
  }
}

export default new CompanyController(companyService)
