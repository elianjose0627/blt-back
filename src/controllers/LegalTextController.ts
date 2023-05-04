import BaseController from './BaseController'
import LegalTextService from '../services/LegalTextService'
import { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const legalTextService = new LegalTextService('LegalText')

class LegalTextController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { legalText } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const response = await legalTextService.insert({ company, legalText })

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [this.recordName()]: response
    })
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset } = req.query
    const { id } = req.params
    const records = await legalTextService.getAllForCompany(limit, offset, id)
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
      [legalTextService.manyRecords()]: records.rows
    })
  }
}

export default new LegalTextController(legalTextService)
