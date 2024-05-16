import BaseController from './BaseController'
import ProductCategoryTagProductAccessControlGroupService from '../services/ProductCategoryTagProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'

const productCategoryTagProductAccessControlGroupService = new ProductCategoryTagProductAccessControlGroupService('ProductCategoryTagProductAccessControlGroup')

class ProductCategoryTagProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      body: { productCategoryTagProductAccessControlGroup: { productCategoryTagIds } },
      params: { id }
    } = req

    const { response, status } = await productCategoryTagProductAccessControlGroupService.insert({
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
}

export default new ProductCategoryTagProductAccessControlGroupController(productCategoryTagProductAccessControlGroupService)
