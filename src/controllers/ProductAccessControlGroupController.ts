import BaseController from './BaseController'
import ProductAccessControlGroupService from '../services/ProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productAccessControlGroupService = new ProductAccessControlGroupService('ProductAccessControlGroup')

class ProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productAccessControlGroup } } = req

    const { response, status } = await productAccessControlGroupService.insert({ productAccessControlGroup })
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

export default new ProductAccessControlGroupController(productAccessControlGroupService)
