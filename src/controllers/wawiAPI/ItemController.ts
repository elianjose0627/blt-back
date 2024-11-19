import BaseController from '../BaseController'
import ItemService from '../../services/wawiAPI/ItemService'
import * as statusCodes from '../../constants/statusCodes'
import type { CustomRequest, CustomResponse } from '../../types'

const itemService = new ItemService('Item')

class ItemController extends BaseController {
  async getItem (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { params: { id } } = req
    const item = await itemService.getItem(id)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      item
    })
  }

  async createItem (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { item } } = req
    const response = await itemService.createItem(item)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      item: response
    })
  }
}

export default new ItemController(itemService)
