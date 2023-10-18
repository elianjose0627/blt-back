import BaseController from './BaseController'
import AddressService from '../services/AddressService'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'

const addressService = new AddressService('Address')

class AddressController extends BaseController {
  checkOwner (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: address } = req

    const isOwner = currentUser.id === address?.company?.owner?.id
    const isEmployee = Boolean(currentUser?.companyId) && currentUser?.companyId === address?.company?.id

    if (isOwner || (isEmployee)) {
      req.isOwner = true
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner can perform this action'
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
