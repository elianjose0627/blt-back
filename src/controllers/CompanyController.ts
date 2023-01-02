import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { v4 as uuidv4 } from 'uuid'
import dns from 'dns'
import BaseController from './BaseController'
import CompanyService from '../services/CompanyService'
import UserService from '../services/UserService'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import AddressService from '../services/AddressService'
import { sendNotifierEmail } from '../utils/sendMail'

dayjs.extend(utc)

const companyService = new CompanyService('Company')
const userService = new UserService('User')
const addressService = new AddressService('Address')

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)
const salesMailer = String(process.env.SALES_MAILER_EMAIL)

const mininumWaitDaysForDomainVerificationCode = 7

class CompanyController extends BaseController {
  checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: company } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR, userRoles.CAMPAIGNMANAGER]

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company?.id

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

  checkOwnerOrCompanyAdministratorOrAdmin (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: company } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR]

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = currentUser?.companyId === company?.id

    if (isOwnerOrAdmin || (isEmployee && allowedRoles.includes(currentUser?.role))) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, company administrator or administrator can perform this action'
        }
      })
    }
  }

  checkCompanyDomainAndEmailDomain (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { body: { company }, record } = req

    const { domain, email } = company

    const companyEmail = email ?? record.email

    const emailDomain = companyEmail.split('@').pop()

    if (domain !== undefined && domain !== emailDomain) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'The email domain and the company domain do not match'
        }
      })
    }

    return next()
  }

  checkCompanyDomain (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { record } = req

    const { domain, isDomainVerified } = record

    if (domain === null || domain === '') {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Add a company domain first in order to perform this action'
        }
      })
    }

    if (isDomainVerified === true) {
      return res.status(statusCodes.OK).send({
        statusCode: statusCodes.OK,
        success: true,
        company: record.toJSONFor()
      })
    }

    return next()
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, user } = req

    const records = await this.service.getAll(limit, offset, user)
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

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user, body: { company } } = req

    const adminCreatedUser = await userService.findByEmail(company.email)

    if (adminCreatedUser === null) {
      const temporaryPassword = uuidv4().substring(0, 8)
      const temporaryUser = {
        firstName: '',
        lastName: '',
        email: company.email,
        password: temporaryPassword,
        isActive: true,
        role: userRoles.COMPANYADMINISTRATOR
      }
      const createdTemporaryUser = await userService.insert({ user: temporaryUser })

      const subject = `An account has been created on your behalf at ${appUrl}`

      const steps = `
      <p>Steps to register an account:</p>
      <ol>
        <li>Please login to your personal user account at ${appUrl} and change your password.</li>
        <li>Please verify your user account.</li>
      </ol>
      `

      const footer = `
      <p>For questions, please reach out to:
      <br>
      General Support: ${mailer}
      <br>
      Orders: ${salesMailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>Your account has been created at ${appUrl} in order to grant you access to the ${appName} corporate merchandise platform on behalf of ${String(company.name)}.<p>
      <p>Your temporary password is: ${temporaryPassword}.</p>
      ${steps}
      <p>You have been granted elevated rights as company administrator of ${String(company.name)}.</p>
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `
      await sendNotifierEmail(createdTemporaryUser.email, subject, message, false, message)
    } else {
      if (adminCreatedUser.role === userRoles.USER) {
        await userService.update(adminCreatedUser, { role: userRoles.COMPANYADMINISTRATOR, logoutTime: Date() })

        const subject = `You have been granted elevated rights as company admin of (${String(company.name)})`

        const footer = `
        <p>For questions, please reach out to:
        <br>
        General Support: ${mailer}
        <br>
        Orders: ${salesMailer}
        </p>
        `

        const message = `<p>Hello ${String(adminCreatedUser.firstName)},</p>
        <p>To make full use of the ${String(appName)} corporate merchandise platform your company ${String(company.name)} has been setup.<p>
        <p>You have been granted elevated rights as company admin of ${String(company.name)}.</p>
        <p>Please login to your user account at ${appUrl}</p>
        <p>Best Regards,<br>
        ${appName} team</p>
        <p>${footer}</p>
        `
        await sendNotifierEmail(adminCreatedUser.email, subject, message, false, message)
      }

      if (adminCreatedUser.role === userRoles.COMPANYADMINISTRATOR && adminCreatedUser.company !== null) {
        return res.status(statusCodes.FORBIDDEN).send({
          statusCode: statusCodes.FORBIDDEN,
          success: false,
          errors: {
            message: 'User specified is already a company admin'
          }
        })
      }
    }

    const { response, status } = await companyService.insert({ user, company })
    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    const userToUpdate = await userService.findByEmail(company.email)
    await userService.update(userToUpdate, { companyId: response.id })

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      company: response
    })
  }

  async getAllUsers (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset }, params: { id: companyId } } = req
    const records = await companyService.getAllUsers(limit, offset, companyId)
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
      users: records.rows
    })
  }

  async updateUserRole (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { user: currentUser, record: company, params: { id: companyId, userId }, body: { user: { role } } } = req

    const allowedRoles = [userRoles.COMPANYADMINISTRATOR]
    const isCompanyOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN

    if (userId === currentUser.id) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update your own role'
        }
      })
    }

    const userToUpdate = await userService.findById(userId)

    if (userToUpdate === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: `${String(userService.model)} not found`
        }
      })
    }

    if (userToUpdate.role === userRoles.ADMIN) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You cannot update the role of an administrator'
        }
      })
    }

    const userToUpdateIsCompanyEmployee = userToUpdate?.company?.id === companyId
    const currentUserIsCompanyEmployee = currentUser?.company?.id === companyId

    if (userToUpdateIsCompanyEmployee &&
      ((currentUserIsCompanyEmployee && allowedRoles.includes(currentUser.role)) || isCompanyOwnerOrAdmin)
    ) {
      const response = await userService.update(userToUpdate, { role, logoutTime: Date() })

      const subject = `You have been granted a new user role by ${String(currentUser.firstName)} ${String(currentUser.lastName)} at ${String(company.name)}`

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      </p>
      `

      const message = `<p>Hello,</p>
      <p>You have been granted a new user role by ${String(currentUser.firstName)} ${String(currentUser.lastName)} at ${appUrl}.<p>
      <p>Please login to your account.</p>
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      await sendNotifierEmail(userToUpdate.email, subject, message, false, message)

      return res.status(statusCodes.OK).send({
        statusCode: statusCodes.OK,
        success: true,
        user: response
      })
    }

    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'Only an admin, the owner or company administrator can perform this action'
      }
    })
  }

  async createAddress (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { address } } = req

    const { response, status } = await addressService.insert({ user: null, company, address })

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

  async getDomainVerificationCode (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company } = req

    const { domainVerificationCode } = company

    const now = dayjs.utc()
    const createdTime = domainVerificationCode.createdAt
    const diff = now.diff(createdTime, 'days')

    const uuid = uuidv4()
    let value = `biglittlethings-domain-verification=${uuidv4().substring(uuid.length - 12)}`
    let createdAt = now

    if (domainVerificationCode.value !== null &&
        domainVerificationCode.createdAt !== null &&
        diff < mininumWaitDaysForDomainVerificationCode
    ) {
      value = domainVerificationCode.value
      createdAt = domainVerificationCode.createdAt
    }

    const response = await companyService.update(company, {
      domainVerificationCode: {
        value,
        createdAt
      }
    })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      company: response
    })
  }

  async verifyDomain (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company } = req

    const { domainVerificationCode } = company

    const getTxtAddresses = function (domain: string): any {
      return new Promise((resolve, reject) => {
        dns.resolveTxt(domain, (err: any, addresses: string[][]) => {
          if (err !== null) reject(err)
          else resolve(addresses)
        })
      })
    }

    if (domainVerificationCode.value === null || domainVerificationCode.createdAt === null) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Request domain verification first to get a domain verification code'
        }
      })
    }

    const now = dayjs.utc()
    const createdAt = domainVerificationCode.createdAt
    const diff = now.diff(createdAt, 'days')

    if (diff > mininumWaitDaysForDomainVerificationCode) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'This domain verification code has expired kindly request another one'
        }
      })
    }

    try {
      const addresses = await getTxtAddresses(company.domain)

      const isDomainVerificationCodePresent = addresses.flat(1).includes(domainVerificationCode.value)

      const response = await companyService.update(company, { isDomainVerified: isDomainVerificationCodePresent })

      return res.status(statusCodes.OK).send({
        statusCode: statusCodes.OK,
        success: true,
        company: response
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

export default new CompanyController(companyService)
