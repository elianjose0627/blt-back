import BaseController from './BaseController'
import PictureService from '../services/PictureService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const pictureService = new PictureService('Picture')

class PictureController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: bundle, body: { picture } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await pictureService.insert({ bundle, picture })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      picture: response
    })
  }

  async getCardsFromFirebase (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, pageToken, filter = { companyId: null } } } = req

    const records = await pictureService.getCardsFromFirebase(limit, pageToken, filter.companyId)

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      nextPage: records.nextPage,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      cards: records.rows
    })
  }
}

export default new PictureController(pictureService)
