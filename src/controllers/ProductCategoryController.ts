import BaseController from './BaseController'
import ProductCategoryService from '../services/ProductCategoryService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productCategoryService = new ProductCategoryService('ProductCategory')

class ProductCategoryController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productCategory } } = req

    const { response, status } = await productCategoryService.insert({ productCategory })
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

  async updateSortOrder (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productCategories } } = req

    const response = await productCategoryService.updateSortOrder({ productCategories })
    io.emit(`${String(productCategoryService.recordName())}`, { message: `${String(productCategoryService.recordName())} updated` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }
}

export default new ProductCategoryController(productCategoryService)
