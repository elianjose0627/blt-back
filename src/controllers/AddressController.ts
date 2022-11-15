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
}

export default new AddressController(addressService)
