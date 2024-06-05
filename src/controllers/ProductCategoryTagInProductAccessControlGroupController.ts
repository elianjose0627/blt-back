import BaseController from './BaseController'
import ProductCategoryTagInProductAccessControlGroupService from '../services/ProductCategoryTagInProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productCategoryTagInProductAccessControlGroupService = new ProductCategoryTagInProductAccessControlGroupService('ProductCategoryTagProductAccessControlGroup')

class ProductCategoryTagInProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      body: { productCategoryTagProductAccessControlGroup: { productCategoryTagIds } },
      params: { id }
    } = req

    const { response, status } = await productCategoryTagInProductAccessControlGroupService.insert({
      productCategoryTagIds,
      productAccessControlGroupId: id
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

  async getAllInProductAccessControlGroup (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search }, params: { id } } = req
    const records = await productCategoryTagInProductAccessControlGroupService.getAllInProductAccessControlGroup(limit, offset, id, search)
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
      [productCategoryTagInProductAccessControlGroupService.manyRecords()]: records.rows
    })
  }
}

export default new ProductCategoryTagInProductAccessControlGroupController(productCategoryTagInProductAccessControlGroupService)
