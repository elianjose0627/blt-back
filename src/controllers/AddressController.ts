import BaseController from './BaseController'
import AddressService from '../services/AddressService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
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

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: { user, company }, body: { address } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await addressService.insert({ user, company, address })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      address: response
    })
  }
}

export default new AddressController(addressService)
