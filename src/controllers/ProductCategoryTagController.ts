import BaseController from './BaseController'
import ProductCategoryTagService from '../services/ProductCategoryTagService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productCategoryTagService = new ProductCategoryTagService('ProductCategoryTag')

class ProductCategoryTagController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productCategoryTag }, record: productCategory } = req

    const { response, status } = await productCategoryTagService.insert({ productCategoryTag, productCategory })
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

export default new ProductCategoryTagController(productCategoryTagService)
