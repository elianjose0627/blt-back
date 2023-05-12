import BaseController from './BaseController'
import RecipientService from '../services/RecipientService'
import { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const recipientService = new RecipientService('Recipient')

class RecipientController extends BaseController {
  checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { campaign: { companyId, company: { owner } } } } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]

    const isOwnerOrAdmin = currentUser.id === owner.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, company administrator, campaign manager or administrator can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: campaign, body: { recipient } } = req

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const { response, status } = await recipientService.insert({ campaign, recipient })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      recipient: response
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset }, params: { id } } = req

    const records = await recipientService.getAll(limit, offset, id, currentUser)
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
      [this.service.manyRecords()]: records.rows
    })
  }
}

export default new RecipientController(recipientService)
