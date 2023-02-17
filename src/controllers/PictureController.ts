import BaseController from './BaseController'
import PictureService from '../services/PictureService'
import { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const pictureService = new PictureService('Picture')

class PictureController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: bundle, body: { picture } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await pictureService.insert({ bundle, picture })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      picture: response
    })
  }
}

export default new PictureController(pictureService)
