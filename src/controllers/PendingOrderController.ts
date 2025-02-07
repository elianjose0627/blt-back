import BaseController from './BaseController'
import PendingOrderService from '../services/PendingOrderService'
import PrivacyRuleService from '../services/PrivacyRuleService'
import type { CustomNext, CustomRequest, CustomResponse, ICampaign, IPendingOrder, Module, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import * as appModules from '../utils/appModules'
import { parseXml } from '../utils/parseXML'

const pendingOrderService = new PendingOrderService('PendingOrder')
const privacyRuleService = new PrivacyRuleService('PrivacyRule')

class PendingOrderController extends BaseController {
  moduleName (): Module {
    return 'orders'
  }

  checkPermission (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { owner: { id }, companyId } } = req

    const isOwnerOrAdmin = currentUser.id === id || currentUser.role === userRoles.ADMIN
    const isCompanyAdminOrCampaignManagerAndEmployee = (currentUser.role === userRoles.COMPANYADMINISTRATOR || currentUser.role === userRoles.CAMPAIGNMANAGER) && currentUser.company.id === companyId

    if (isOwnerOrAdmin || isCompanyAdminOrCampaignManagerAndEmployee) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You do not have the necessary permissions to perform this action'
        }
      })
    }
  }

  checkIsPostedOrQueued (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { record: pendingOrder } = req

    const isPostedOrQueued = pendingOrder.isPosted === true || pendingOrder.isQueued === true

    if (!isPostedOrQueued) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot perform this action for a posted or queued order'
        }
      })
    }
  }

  checkIsCataloguePendingOrder (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { record: pendingOrder } = req

    if (pendingOrder.campaignId === null) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot perform this action for a catalogue pending order'
        }
      })
    }
    return next()
  }

  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, params: { id } } = req

    const record = await pendingOrderService.get(id, currentUser)
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [pendingOrderService.singleRecord()]: record
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, query: { limit, page, offset, search, filter } } = req

    const records = await pendingOrderService.getAll(limit, offset, currentUser, search, filter)
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
      [pendingOrderService.manyRecords()]: records.rows
    })
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { pendingOrders }, user: currentUser, record: campaign } = req

    if (campaign.company.customerId === null) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: `Contact admin to set the company customer id for ${String(campaign.company.name)} - ${String(campaign.company.id)}`
        }
      })
    }

    const {
      isQuotaEnabled, isExceedQuotaEnabled, usedQuota, totalOrderedQuota, correctionQuota,
      campaignOrderLimits, isBulkCreateEnabled
    } = campaign as ICampaign

    if (!isBulkCreateEnabled && pendingOrders.length > 1) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Bulk create is not enabled for this campaign'
        }
      })
    }

    const pendingOrdersQuantity: number = pendingOrders.reduce((accumulator: number, pendingOrder: IPendingOrder) => accumulator + pendingOrder.quantity, 0)
    const totalUsedQuota = usedQuota + correctionQuota
    const allowedRoles = [userRoles.ADMIN]

    if (!allowedRoles.includes(currentUser.role) && (isQuotaEnabled && !isExceedQuotaEnabled) && (totalUsedQuota + pendingOrdersQuantity) > totalOrderedQuota) {
      return res.status(statusCodes.TOO_MANY_REQUESTS).send({
        statusCode: statusCodes.TOO_MANY_REQUESTS,
        success: false,
        errors: {
          message: `Campaign quota has been exceeded by ${(totalUsedQuota + pendingOrdersQuantity) - totalOrderedQuota}`
        }
      })
    }

    const existingOrders = await pendingOrderService.findPendingOrders(currentUser.id, campaign.id)
    const campaignOrderLimit = campaignOrderLimits.find((campaignOrderLimit) => campaignOrderLimit.role === currentUser.role)

    if (campaignOrderLimit !== undefined && ((pendingOrdersQuantity + parseInt(existingOrders.count, 10)) > campaignOrderLimit.limit)) {
      return res.status(statusCodes.TOO_MANY_REQUESTS).send({
        statusCode: statusCodes.TOO_MANY_REQUESTS,
        success: false,
        errors: {
          message: `Campaign order limit has been exceeded by ${(pendingOrdersQuantity + parseInt(existingOrders.count, 10)) - campaignOrderLimit.limit}`
        }
      })
    }

    const { response, status } = await pendingOrderService.insert({ pendingOrders, currentUser, campaign })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.manyRecords()]: response
    })
  }

  async insertCataloguePendingOrders (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { pendingOrders }, user: currentUser } = req

    const { response, status } = await pendingOrderService.insertCataloguePendingOrders({ pendingOrders, currentUser })
    io.emit(`${String(pendingOrderService.recordName())}`, { message: `${String(pendingOrderService.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [pendingOrderService.manyRecords()]: response
    })
  }

  async duplicate (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { postedOrders }, user: currentUser } = req

    const response = await pendingOrderService.duplicate({ postedOrders, currentUser })

    if (response.message !== undefined) {
      return res.status(response.statusCode).send({
        statusCode: response.statusCode,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [pendingOrderService.manyRecords()]: response
    })
  }

  async update (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { pendingOrder }, user: currentUser, record } = req
    const { response, status } = await pendingOrderService.update({ pendingOrder, currentUser, record })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} updated` })

    const { id: userId, companyId, role } = currentUser
    const privacyRule = companyId !== null ? await privacyRuleService.find(companyId, role, appModules.ORDERS) : null

    if (privacyRule !== null && record.userId !== userId) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You are not allowed to update this pending order because of a privacy rule'
        }
      })
    }

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async insertGETECPendingOrder (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser } = req
    const files: Express.Multer.File[] = req.files as Express.Multer.File[]
    try {
      const parsedData = []
      for (const file of files) {
        // Parse XML content
        const xmlContent = file.buffer.toString('utf-8')
        const parsedFileData = await parseXml(xmlContent)
        if (parsedFileData.status === false) {
          return res.status(statusCodes.BAD_REQUEST).send({
            statusCode: statusCodes.BAD_REQUEST,
            success: false,
            errors: {
              message: parsedFileData.message
            }
          })
        }
        parsedData.push(parsedFileData.xmlDoc)
      }

      const { response, status } = await pendingOrderService.insertGETECPendingOrder({ currentUser, parsedData })
      io.emit('pendingOrders', { message: 'pendingOrders created' })

      const statusCode: StatusCode = {
        200: statusCodes.OK,
        201: statusCodes.CREATED
      }

      return res.status(statusCode[status]).send({
        statusCode: statusCode[status],
        success: true,
        [pendingOrderService.manyRecords()]: response
      })
    } catch (error: any) {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: error.message
        }
      })
    }
  }
}

export default new PendingOrderController(pendingOrderService)
