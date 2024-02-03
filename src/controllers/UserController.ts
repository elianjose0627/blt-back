import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Joi from 'joi'

import BaseController from './BaseController'
import UserService from '../services/UserService'
import CompanyService from '../services/CompanyService'
import AddressService from '../services/AddressService'
import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse, Nullable, StatusCode } from '../types'
import * as userRoles from '../utils//userRoles'
import { sendNotifierEmail } from '../utils/sendMail'
import { io } from '../utils/socket'
import { decryptUUID } from '../utils/encryption'

dayjs.extend(utc)
const userService = new UserService('User')
const addressService = new AddressService('Address')
const companyService = new CompanyService('Company')

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)
const sandboxMode = process.env.NODE_ENV === 'test'

interface SelectedCompanyId {
  [key: string]: Nullable<string>
}

class UserController extends BaseController {
  async checkOwner (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, params: { id } } = req

    if (currentUser.id === id) {
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

  async checkOwnerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { user: currentUser, params: { id } } = req
    const isOwnerOrAdmin = currentUser.id === id || currentUser.role === userRoles.ADMIN

    if (isOwnerOrAdmin) {
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

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { user }, user: currentUser, query: { companyId } } = req
    let decryptedCompanyId

    try {
      if (companyId !== undefined) {
        decryptedCompanyId = decryptUUID(companyId, 'hex')
      }
    } catch (error) {
      return res.status(statusCodes.UNPROCESSABLE_ENTITY).send({
        statusCode: statusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        errors: {
          message: 'Invalid invitation link'
        }
      })
    }

    const uuidSchema = Joi.string().uuid().message('Invalid invitation link')

    const { error } = uuidSchema.validate(decryptedCompanyId)

    if (error != null) {
      return res.status(statusCodes.UNPROCESSABLE_ENTITY).send({
        statusCode: statusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        errors: {
          message: error.message
        }
      })
    }

    // Used != to capture value that is undefined
    if ((user.companyId ?? decryptedCompanyId) != null) {
      const company = await companyService.findById(user.companyId ?? decryptedCompanyId)
      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: 'Company not found'
          }
        })
      }
    }

    const record = await userService.insert({ user, currentUser, companyId: decryptedCompanyId })

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    return res.status(statusCodes.CREATED).send({
      statusCode: statusCodes.CREATED,
      success: true,
      [this.service.singleRecord()]: record
    })
  }

  async login (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { user: { email, password } } } = req
    const response = await userService.login(email, password)
    const statusCode = response.message === 'User not found' ? statusCodes.NOT_FOUND : statusCodes.UNAUTHORIZED

    if (response.message !== undefined) {
      return res.status(statusCode).send({
        statusCode,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      token: response.token,
      user: response.user
    })
  }

  async updateRole (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, user } = req
    const { id } = req.params
    const { role } = req.body.user

    if (user.id === id) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update your own role'
        }
      })
    }

    const response = await userService.update(record, { role })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateEmailVerification (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { user: { isVerified } } } = req

    const response = await userService.update(record, { isVerified, logoutTime: Date() })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateActiveState (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, user, params: { id }, body: { user: { isActive } } } = req

    if (user.id === id) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update your own active status'
        }
      })
    }

    const logoutTime = isActive === true ? null : Date()

    const response = await userService.update(record, { isActive, logoutTime })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updatePassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req
    const { password, currentPassword } = req.body.user

    const response = await userService.updatePassword(record, { password, currentPassword, logoutTime: Date(), isActive: true })

    if (response.message !== undefined) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        user: response
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updatePasswordAdmin (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { user: { sendEmail } } } = req

    const response = await userService.updatePasswordAdmin(record, { sendEmail, logoutTime: Date(), isActive: true })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async logout (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req
    await userService.logout(user.email)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email: user.email,
        message: 'You have been logged out'
      }
    })
  }

  async forgotPassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { email } = req.body.user

    const response = await userService.forgotPassword(email)

    if (response.message !== undefined) {
      return res.status(response.status).send({
        statusCode: response.status,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email,
        message: 'A password reset link has been sent to your email'
      }
    })
  }

  async resetPassword (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { password } = req.body.user
    const { user } = req

    const response = await userService.update(user, { password, logoutTime: Date(), isActive: true })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async sendVerifyEmail (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req
    const response = await userService.sendVerifyEmail(user)

    if (response.message !== undefined) {
      return res.status(response.status).send({
        statusCode: response.status,
        success: false,
        errors: {
          message: response.message
        }
      })
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        email: user.email,
        message: 'A verification code has been sent to your email'
      }
    })
  }

  async verifyEmail (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user } = req

    const response = await userService.update(user, { isVerified: true, logoutTime: Date() })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateNotifications (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { notifications } = req.body.user
    const { user } = req

    const response = await userService.update(user, { notifications: { ...user.notifications, ...notifications } })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async addOrRemoveUserFromCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      user,
      body: { user: { email, actionType, role } },
      record: { id: companyId, name, domain, isDomainVerified }
    } = req

    const emailDomain = email.split('@').pop()

    if (domain === null || domain === '') {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Add and verify a company domain first in order to perform this action'
        }
      })
    }

    if (isDomainVerified === false) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Verify the company domain first in order to perform this action'
        }
      })
    }

    if (domain !== emailDomain && actionType === 'add') {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'The email domain and the company domain do not match'
        }
      })
    }

    const employee = await userService.findByEmail(email)

    if (employee === null) {
      const subject = `You have been invited by ${String(user.firstName)} ${String(user.lastName)} to create an account at ${String(name)}`

      const steps = `
      <p>Steps to register an account:</p>
      <ol>
        <li>Register an account using your email address ${String(email)} at ${appUrl}</li>
        <li>Verify your account to fully activate it.</li>
      </ol>
      `

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been invited by ${String(user.firstName)} ${String(user.lastName)} to create an account at ${appUrl}.<p>
      ${steps}
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(email, subject, message, false, message, sandboxMode)

      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `The user was not found, an invitation email has been sent to ${String(email)}`
        }
      })
    }

    const selectedCompanyId: SelectedCompanyId = {
      add: companyId,
      remove: null
    }

    let updatedRole = employee.role === userRoles.USER ? userRoles.EMPLOYEE : employee.role

    if (actionType === 'remove') {
      updatedRole = userRoles.USER
    }

    if (actionType === 'add' && role !== undefined && role !== userRoles.ADMIN) {
      updatedRole = role
    }

    const response = await userService.update(employee, { companyId: selectedCompanyId[actionType], role: updatedRole, logoutTime: dayjs.utc() })

    if (actionType === 'remove') {
      response.company = null
    }

    if (actionType === 'add') {
      const subject = `You have been granted a new user role by ${String(user.firstName)} ${String(user.lastName)} at ${String(name)}`

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been granted a new user role by ${String(user.firstName)} ${String(user.lastName)} at ${appUrl}.<p>
      <p>Please login to your account.</p>
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(email, subject, message, false, message, sandboxMode)
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async updateUserCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      record: user,
      body: { user: { companyId } }
    } = req

    const company = await companyService.findById(companyId)

    if (company === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Company not found'
        }
      })
    }

    const response = await userService.update(user, { companyId, logoutTime: dayjs.utc() })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: response
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { limit, page, offset, search } = req.query
    const records = await userService.getAll(limit, offset, search)

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

  async getMyProfile (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, accessPermissions } = req
    const formattedUser = user.toJSONFor()
    const company = formattedUser.company === null
      ? null
      : {
          ...formattedUser.company.toJSONFor(),
          defaultAccessPermissions: accessPermissions
        }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      user: {
        ...formattedUser,
        company
      }
    })
  }

  async getProfileById (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: { id, firstName, lastName, username, photo } } = req
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      profile: {
        id,
        firstName,
        lastName,
        username,
        photo
      }
    })
  }

  async createAddress (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { address }, params: { id } } = req

    const user = await userService.findById(id)

    const { response, status } = await addressService.insert({ user, company: null, address })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      address: response
    })
  }

  async updateUserCompanyViaInviteCode (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { user }, record: userRecord } = req
    const encryptedCompanyId = user.companyInviteCode
    let decryptedCompanyId

    try {
      decryptedCompanyId = decryptUUID(encryptedCompanyId, 'base64')
    } catch (error) {
      return res.status(statusCodes.UNPROCESSABLE_ENTITY).send({
        statusCode: statusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        errors: {
          message: 'Invalid invitation code'
        }
      })
    }

    const uuidSchema = Joi.string().uuid().message('Invalid invitation code')

    const { error } = uuidSchema.validate(decryptedCompanyId)

    if (error != null) {
      return res.status(statusCodes.UNPROCESSABLE_ENTITY).send({
        statusCode: statusCodes.UNPROCESSABLE_ENTITY,
        success: false,
        errors: {
          message: error.message
        }
      })
    }

    const company = await companyService.findById(decryptedCompanyId)
    if (company === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Company not found'
        }
      })
    }

    const record = await userService.update(userRecord, {
      companyId: decryptedCompanyId,
      role: userRoles.EMPLOYEE,
      logoutTime: dayjs.utc()
    })

    io.emit(`${String(userService.singleRecord())}`, { message: `${String(userService.singleRecord())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [userService.singleRecord()]: record
    })
  }
}

export default new UserController(userService)
