import BaseController from './BaseController'
import AddressService from '../services/AddressService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const addressService = new AddressService('Address')

class AddressController extends BaseController {
  checkOwnerOrCompanyAdministrator (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: address } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR]

    const isOwner = currentUser?.id === address?.company?.owner?.id
    const isEmployee = currentUser?.companyId === address?.company?.id

    if (isOwner || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or company administrator can perform this action'
        }
      })
    }
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset } = req.query
    const { id } = req.params
    const records = await addressService.getAllForCompany(limit, offset, id)
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
      [addressService.manyRecords()]: records.rows
    })
  }
}

export default new AddressController(addressService)
