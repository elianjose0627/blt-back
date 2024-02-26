import BaseController from './BaseController'
import CompanySubscriptionService from '../services/CompanySubscriptionService'
import type { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const companySubscriptionService = new CompanySubscriptionService('CompanySubscription')

class CompanySubscriptionController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { companySubscription } } = req

    const { response, status } = await companySubscriptionService.insert({ company, companySubscription })
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

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id } } = req

    const records = await companySubscriptionService.getAllForCompany(limit, offset, id)
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
      module: req.module,
      [companySubscriptionService.manyRecords()]: records.rows
    })
  }
}

export default new CompanySubscriptionController(companySubscriptionService)
