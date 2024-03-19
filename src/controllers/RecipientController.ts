import BaseController from './BaseController'
import RecipientService from '../services/RecipientService'
import PrivacyRuleService from '../services/PrivacyRuleService'
import type { CustomNext, CustomRequest, CustomResponse, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import * as appModules from '../utils/appModules'

const recipientService = new RecipientService('Recipient')
const privacyRuleService = new PrivacyRuleService('PrivacyRule')

class RecipientController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { campaign: { companyId, company: { owner } } } } = req

    const isOwnerOrAdmin = currentUser.id === owner.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or administrator can perform this action'
        }
      })
    }
  }

  async checkPrivacyRule (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, record: { campaign: { companyId } } } = req

    const privacyRule = await privacyRuleService.find(companyId, currentUser.role, appModules.RECIPIENTS)

    if (privacyRule === null) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: `Disable privacy rule for ${appModules.RECIPIENTS} module and ${String(currentUser.role)} role to be able to perform this action`
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
    const { user: currentUser, query: { limit, page, offset, search }, params: { id } } = req

    const records = await recipientService.getAll(limit, offset, id, currentUser, search)
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
