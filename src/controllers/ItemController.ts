import BaseController from './BaseController'
import ItemService from '../services/ItemService'
import { CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const itemService = new ItemService('Item')

class ItemController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: bundle, body: { item } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await itemService.insert({ item, bundle })

    const statusCode = {
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

export default new ItemController(itemService)
