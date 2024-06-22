import BaseController from './BaseController'
import ProductInProductCategoryService from '../services/ProductInProductCategoryService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productInProductCategoryService = new ProductInProductCategoryService('ProductProductCategory')

class ProductInProductCategoryController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productCategory: { productIds } }, params: { id } } = req

    const { response, status } = await productInProductCategoryService.insert({
      productIds,
      productCategoryId: id
    })
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

  async getAllProductsInProductCategory (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search }, params: { id } } = req
    const records = await productInProductCategoryService.getAllProductsInProductCategory(limit, offset, id, search)
    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [productInProductCategoryService.manyRecords()]: records.rows
    })
  }
}

export default new ProductInProductCategoryController(productInProductCategoryService)
