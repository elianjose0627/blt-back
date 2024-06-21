import BaseController from './BaseController'
import ProductTagService from '../services/ProductTagService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import ProductCategoryTagService from '../services/ProductCategoryTagService'

const productTagService = new ProductTagService('ProductTag')
const productCategoryTagService = new ProductCategoryTagService('ProductCategoryTag')

class ProductTagController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productTag }, record: product } = req

    const foundProductCategoryTags = await productCategoryTagService.searchProductCategoryTagsByIds(productTag.productCategoryTagIds)

    if (productTag.productCategoryTagIds.length > 0 && foundProductCategoryTags.count === 0) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(productTagService.recordName())}${productTag.productCategoryTagIds.length > 1 ? 's' : ''} not found`
        }
      })
    }

    const { response, status } = await productTagService.insert({ productCategoryTags: foundProductCategoryTags.rows, product })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED,
      204: statusCodes.NO_CONTENT
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [productTagService.manyRecords()]: response
    })
  }
}

export default new ProductTagController(productTagService)
