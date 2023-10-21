import { Joi, Segments, celebrate } from 'celebrate'
import BaseController from './BaseController'
import AccessPermissionService from '../services/AccessPermissionService'
import CompanyService from '../services/CompanyService'
import type { CustomNext, CustomRequest, CustomResponse, IAccessPermission, Role, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import * as permissions from '../utils/permissions'
import { allowedCompanyModules } from '../utils/appModules'

const accessPermissionService = new AccessPermissionService('AccessPermission')
const companyService = new CompanyService('Company')

const generateAccessPermissionSchema = (accessPermissions: IAccessPermission[], role: Role): any => {
  const allowedCampaignManagerModules = accessPermissions
    .filter((accessPermission: IAccessPermission) => accessPermission.role === userRoles.CAMPAIGNMANAGER)
    .map((accessPermission: IAccessPermission) => accessPermission.module)

  return {
    name: Joi.string().required().max(128),
    module: Joi.when('role', {
      is: role,
      then: Joi.when('override', {
        is: true,
        then: Joi.string().required().valid(...allowedCompanyModules.map(allowedCompanyModule => allowedCompanyModule.value)),
        otherwise: Joi.string().required()
          .valid(...allowedCompanyModules
            .filter(module => !allowedCampaignManagerModules.includes(module.value))
            .map(allowedCompanyModule => allowedCompanyModule.value))
      })
    }),
    role: Joi.string()
      .valid(...[userRoles.USER, userRoles.EMPLOYEE, userRoles.CAMPAIGNMANAGER])
      .required(),
    permission: Joi.string().required().valid(...[permissions.READ, permissions.READWRITE]),
    isEnabled: Joi.boolean().default(true),
    override: Joi.boolean().default(false)
  }
}
class AccessPermissionController extends BaseController {
  checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: accessPermission } = req

    const company = accessPermission.company

    const isOwnerOrAdmin = currentUser.id === company?.owner.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company.id

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner or admin can perform this action'
        }
      })
    }
  }

  checkAllowedModules (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { accessPermissions = [] } = req

    const commonAccessPermissionSchema = generateAccessPermissionSchema(accessPermissions, userRoles.CAMPAIGNMANAGER)

    const validateAccessPermission = Joi.object({
      accessPermission: Joi.object(commonAccessPermissionSchema).required()
    })

    celebrate({
      [Segments.BODY]: validateAccessPermission
    }, { abortEarly: false })(req, res, next)
  }

  checkAllowedModulesAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { accessPermissions = [] } = req

    const commonAccessPermissionSchema = generateAccessPermissionSchema(accessPermissions, userRoles.CAMPAIGNMANAGER)

    const validateAccessPermissionAdmin = Joi.object({
      accessPermission: Joi.object({
        ...commonAccessPermissionSchema,
        companyId: Joi.string().required().uuid()
      }).required()
    })

    celebrate({
      [Segments.BODY]: validateAccessPermissionAdmin
    }, { abortEarly: false })(req, res, next)
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { accessPermission }, record: initialCompany } = req

    let company = initialCompany

    if (accessPermission.companyId !== undefined) {
      company = await companyService.findById(accessPermission.companyId)

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

    const { response, status } = await accessPermissionService.insert({ accessPermission, company })
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

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id } } = req

    const records = await accessPermissionService.getAllForCompany(limit, offset, id)
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
      [accessPermissionService.manyRecords()]: records.rows
    })
  }
}

export default new AccessPermissionController(accessPermissionService)
