import BaseController from './BaseController'
import ProductSizeService from '../services/ProductSizeService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productSizeService = new ProductSizeService('ProductSize')

class ProductSizeController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productSize } } = req

    const { response, status } = await productSizeService.insert({ productSize })
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

export default new ProductSizeController(productSizeService)
