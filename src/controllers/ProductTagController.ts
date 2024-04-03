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

    if (product.productCategory === null) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: 'Assign a category to this product in order to add tags'
        }
      })
    }

    const foundProductCategoryTags = await productCategoryTagService.searchProductCategoryTagsByIds(productTag.productCategoryTagIds, product.productCategory.id)

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
