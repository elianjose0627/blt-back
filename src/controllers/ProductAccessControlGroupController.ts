import BaseController from './BaseController'
import ProductAccessControlGroupService from '../services/ProductAccessControlGroupService'
import { CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import CompanyService from '../services/CompanyService'

const productAccessControlGroupService = new ProductAccessControlGroupService('ProductAccessControlGroup')
const companyService = new CompanyService('Company')

class ProductAccessControlGroupController extends BaseController {
  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { productAccessControlGroup } } = req

    const { companyId } = productAccessControlGroup

    if (companyId != null) { // checks for undefined or null
      const company = await companyService.findById(companyId)
      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: `${String(companyService.model)} not found`
          }
        })
      }
    }

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
