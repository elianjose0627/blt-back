import BaseController from './BaseController'
import ProductMaterialService from '../services/ProductMaterialService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productMaterialService = new ProductMaterialService('ProductMaterial')

class ProductMaterialController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productMaterial } } = req

    const { response, status } = await productMaterialService.insert({ productMaterial })
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

export default new ProductMaterialController(productMaterialService)
