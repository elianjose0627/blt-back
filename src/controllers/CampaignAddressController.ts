import BaseController from './BaseController'
import CampaignAddressService from '../services/CampaignAddressService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const campaignAddressService = new CampaignAddressService('CampaignAddress')

class CampaignOrderLimitController extends BaseController {
  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { campaign: { company: { id: companyId, owner } } } } = req

    const isOwnerOrAdmin = currentUser.id === owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, employee or admin can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { campaignAddress } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await campaignAddressService.insert({ campaign, campaignAddress })

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

  async delete (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await this.service.delete(record)

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} deleted` })

    return res.status(statusCodes.NO_CONTENT).send(response)
  }
}

export default new CampaignOrderLimitController(campaignAddressService)
