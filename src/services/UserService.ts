import { Op } from 'sequelize'
import { v1 as uuidv1 } from 'uuid'
import db from '../models'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BaseService from './BaseService'
import { sendNotifierEmail } from '../utils/sendMail'
import generateToken from '../utils/generateToken'
import generateOtp from '../utils/generateOtp'
import * as userRoles from '../utils/userRoles'
import generatePassword from '../utils/generatePassword'
import { IEmailTemplate } from '../types'
import { replacePlaceholders } from '../utils/replacePlaceholders'

dayjs.extend(utc)

const expiresIn = process.env.TOKEN_EXPIRATION

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)
const salesMailer = String(process.env.SALES_MAILER_EMAIL)
const adminEmail = String(process.env.ADMIN_EMAIL)
const resetPasswordExpiration = '10 minutes'
const sandboxMode = process.env.NODE_ENV === 'test'
const passwordLength = 8

const include = [
  {
    model: db.Company,
    attributes: ['id', 'customerId', 'name', 'suffix', 'email', 'phone', 'vat', 'domain', 'isDomainVerified'],
    as: 'company',
    include: [
      {
        model: db.Address,
        attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
        as: 'addresses'
      },
      {
        model: db.User,
        attributes: ['id', 'firstName', 'lastName', 'email'],
        as: 'owner'
      }
    ]
  },
  {
    model: db.Address,
    attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'type'],
    as: 'addresses'
  }
]

class UserService extends BaseService {
  async findByEmail (email: string): Promise<any> {
    const user = await db[this.model].findOne({
      include,
      where: {
        email
      }
    })
    return user
  }

  async insert (data: any): Promise<any> {
    const { user, currentUser, isTemporary, companyId } = data
    let record

    if (companyId !== undefined) {
      record = await db[this.model].create({ ...user, id: uuidv1(), role: userRoles.EMPLOYEE, companyId })
    } else {
      record = await db[this.model].create({ ...user, id: uuidv1() })
    }

    const { email, firstName, role, lastName, salutation } = record

    if (isTemporary !== true) {
      let subject = ''
      let message = ''
      let accountWelcomeEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
        include: {
          model: db.EmailTemplateType,
          as: 'emailTemplateType',
          where: {
            type: currentUser?.role === userRoles.ADMIN ? 'accountWelcomeAdmin' : 'accountWelcome'
          }
        },
        where: {
          isDefault: false
        }
      })

      if (accountWelcomeEmailTemplate === null) {
        const defaultAccountWelcomeEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
          include: {
            model: db.EmailTemplateType,
            as: 'emailTemplateType',
            where: {
              type: currentUser?.role === userRoles.ADMIN ? 'accountWelcomeAdmin' : 'accountWelcome'
            }
          },
          where: {
            isDefault: true
          }
        })
        accountWelcomeEmailTemplate = defaultAccountWelcomeEmailTemplate
      }
      const replacements = {
        app: appName,
        firstname: firstName,
        lastname: lastName,
        salutation,
        url: appUrl,
        role,
        useremail: email,
        adminemail: adminEmail,
        mailer,
        salesmailer: salesMailer,
        password: user.password
      }
      subject = replacePlaceholders(accountWelcomeEmailTemplate.subject, replacements)
      message = replacePlaceholders(accountWelcomeEmailTemplate.template, replacements)

      await sendNotifierEmail(email, subject, message, false, message, sandboxMode)
    }

    return record.toJSONFor()
  }

  async login (email: string, password: string): Promise<any> {
    const user = await db[this.model].findOne({
      include,
      where: {
        email
      }
    })

    if (user === null) {
      return { message: 'User not found' }
    }

    if (user.isActive === false) {
      return { message: 'User account has been blocked' }
    }
    const mininumWaitMinutes = 30
    const mininumFailedAttempts = 5
    const now = dayjs.utc()
    const lastFailed = user.loginTime.lastFailed
    const diff = now.diff(lastFailed, 'minute')
    const failedAttempts = user.loginTime.failed
    const trialTime = mininumWaitMinutes - diff

    if (failedAttempts !== 0 && (failedAttempts % mininumFailedAttempts) === 0 && diff < mininumWaitMinutes) {
      return {
        message: `Too many failed attempts, try again in ${trialTime} ${trialTime === 1 ? 'minute' : 'minutes'}`
      }
    }

    return user.comparePassword(password, async (match: boolean) => {
      if (match) {
        const token = generateToken(user, 'login', expiresIn)
        const loginTime = {
          ...user.loginTime,
          lastSuccessful: dayjs.utc(),
          failed: 0
        }
        await db[this.model].update({
          loginTime
        }, {
          where: {
            email
          }
        })

        return {
          token,
          user: user.toJSONFor()
        }
      } else {
        const loginTime = {
          ...user.loginTime,
          lastFailed: dayjs.utc(),
          failed: Number(user.loginTime.failed) + 1
        }
        await db[this.model].update({
          loginTime
        }, {
          where: {
            email
          }
        })
        return { message: 'Username or password may be incorrect' }
      }
    })
  }

  async logout (email: string): Promise<any> {
    const record = await db[this.model].update({
      logoutTime: dayjs.utc()
    }, {
      where: {
        email
      }
    })
    return record
  }

  async updatePassword (record: any, data: any): Promise<any> {
    const { currentPassword, password, logoutTime } = data

    return record.comparePassword(currentPassword, async (match: boolean) => {
      if (match) {
        const updatedRecord = await record.update({ password, logoutTime })

        const bccStatus = false
        let message = ''
        let subject = ''

        let updatePasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
          include: {
            model: db.EmailTemplateType,
            as: 'emailTemplateType',
            where: {
              type: 'updatePassword'
            }
          },
          where: {
            isDefault: false
          }
        })

        if (updatePasswordEmailTemplate === null) {
          const defaultUpdatePasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
            include: {
              model: db.EmailTemplateType,
              as: 'emailTemplateType',
              where: {
                type: 'updatePassword'
              }
            },
            where: {
              isDefault: true
            }
          })
          updatePasswordEmailTemplate = defaultUpdatePasswordEmailTemplate
        }
        const replacements = {
          app: appName,
          firstname: updatedRecord.firstName,
          lastname: updatedRecord.lastName,
          salutation: updatedRecord.salutation,
          url: appUrl,
          adminemail: adminEmail,
          mailer,
          salesmailer: salesMailer,
          password,
          useremail: updatedRecord.email
        }
        subject = replacePlaceholders(updatePasswordEmailTemplate.subject, replacements)
        message = replacePlaceholders(updatePasswordEmailTemplate.template, replacements)

        try {
          await sendNotifierEmail(updatedRecord.email, subject, message, bccStatus, message, sandboxMode)
        } catch (error) {}

        return updatedRecord.toJSONFor()
      } else {
        return { message: 'Current password is incorrect' }
      }
    })
  }

  async updatePasswordAdmin (record: any, data: any): Promise<any> {
    const { sendEmail, logoutTime } = data

    let updatePasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
      include: {
        model: db.EmailTemplateType,
        as: 'emailTemplateType',
        where: {
          type: 'updatePassword'
        }
      },
      where: {
        isDefault: false
      }
    })

    const password = generatePassword(passwordLength)

    const updatedRecord = await record.update({ password, logoutTime })
    if (sendEmail === true) {
      const bccStatus = false
      let message = ''
      let subject = ''

      if (updatePasswordEmailTemplate === null) {
        const defaultUpdatePasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
          include: {
            model: db.EmailTemplateType,
            as: 'emailTemplateType',
            where: {
              type: 'updatePassword'
            }
          },
          where: {
            isDefault: true
          }
        })
        updatePasswordEmailTemplate = defaultUpdatePasswordEmailTemplate
      }
      const replacements = {
        app: appName,
        firstname: updatedRecord.firstName,
        lastname: updatedRecord.lastName,
        url: appUrl,
        salutation: updatedRecord.salutation,
        adminemail: adminEmail,
        mailer,
        salesmailer: salesMailer,
        password
      }
      subject = replacePlaceholders(updatePasswordEmailTemplate.subject, replacements)
      message = replacePlaceholders(updatePasswordEmailTemplate.template, replacements)

      try {
        await sendNotifierEmail(updatedRecord.email, subject, message, bccStatus, message, sandboxMode)
      } catch (error) {}
    }
    return { ...updatedRecord.toJSONFor(), password }
  }

  async forgotPassword (email: string): Promise<any> {
    const user = await db[this.model].findOne({
      where: {
        email
      }
    })

    if (user !== null) {
      const token = generateToken(user, 'reset', resetPasswordExpiration)
      const { firstName, lastName, salutation } = user

      const replacements = {
        app: appName,
        firstname: firstName,
        lastname: lastName,
        url: appUrl,
        salutation,
        adminemail: adminEmail,
        mailer,
        salesmailer: salesMailer,
        token,
        expiration: resetPasswordExpiration
      }

      let subject = ''
      let message = ''

      let forgotPasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
        include: {
          model: db.EmailTemplateType,
          as: 'emailTemplateType',
          where: {
            type: 'forgotPassword'
          }
        },
        where: {
          isDefault: false
        }
      })

      if (forgotPasswordEmailTemplate === null) {
        const defaultForgotPasswordEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
          include: {
            model: db.EmailTemplateType,
            as: 'emailTemplateType',
            where: {
              type: 'forgotPassword'
            }
          },
          where: {
            isDefault: true
          }
        })
        forgotPasswordEmailTemplate = defaultForgotPasswordEmailTemplate
      }
      subject = replacePlaceholders(forgotPasswordEmailTemplate.subject, replacements)
      message = replacePlaceholders(forgotPasswordEmailTemplate.template, replacements)

      const info = await sendNotifierEmail(email, subject, message, false, message, false)

      if (info[0].statusCode === 202) {
        return info
      }

      return {
        status: 400,
        message: 'email was not sent'
      }
    }

    return {
      status: 404,
      message: 'user not found'
    }
  }

  async sendVerifyEmail (user: any): Promise<any> {
    const { email, firstName, lastName, salutation } = user
    const otp = generateOtp()
    let subject = ''
    let message = ''

    let accountVerificationEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
      include: {
        model: db.EmailTemplateType,
        as: 'emailTemplateType',
        where: {
          type: 'accountVerification'
        }
      },
      where: {
        isDefault: false
      }
    })

    if (accountVerificationEmailTemplate === null) {
      const defaultAccountVerificationEmailTemplate: IEmailTemplate = await db.EmailTemplate.findOne({
        include: {
          model: db.EmailTemplateType,
          as: 'emailTemplateType',
          where: {
            type: 'accountVerification'
          }
        },
        where: {
          isDefault: true
        }
      })
      accountVerificationEmailTemplate = defaultAccountVerificationEmailTemplate
    }
    const replacements = {
      app: appName,
      firstname: firstName,
      lastname: lastName,
      url: appUrl,
      salutation,
      adminemail: adminEmail,
      mailer,
      salesmailer: salesMailer,
      otp: otp.toString()
    }
    subject = replacePlaceholders(accountVerificationEmailTemplate.subject, replacements)
    message = replacePlaceholders(accountVerificationEmailTemplate.template, replacements)

    await user.update({ otp: { createdAt: dayjs.utc(), value: otp } })

    const info = await sendNotifierEmail(email, subject, message, false, message, false)

    if (info[0].statusCode === 202) {
      return info
    }

    return {
      status: 400,
      message: 'email was not sent'
    }
  }

  async getAll (limit: number, offset: number, search?: string): Promise<any> {
    let users
    if (search !== undefined) {
      users = await db[this.model].findAndCountAll({
        include,
        where: {
          [Op.or]: [
            { email: { [Op.iLike]: `%${search}%` } },
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } }
          ]
        },
        limit,
        offset,
        order: [
          ['createdAt', 'DESC']
        ]
      })
    } else {
      users = await db[this.model].findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include
      })
    }

    return {
      count: users.count,
      rows: users.rows.map((record: any) => record.toJSONFor())
    }
  }

  async updateUserAndAddress (record: any, data: any): Promise<any> {
    const { address } = data
    let addressPromise

    if (address !== null) {
      const foundAddress = await db.Address.findOne({
        where: {
          userId: record.id,
          [Op.or]: [
            { id: address.id },
            { type: address.type }
          ]
        },
        paranoid: false // To get soft deleted record
      })

      if (foundAddress !== null) {
        await foundAddress.restore()
        addressPromise = foundAddress.update(address)
      } else {
        addressPromise = db.Address.create({ ...address, id: uuidv1(), userId: record.id })
      }
    }
    const [addressResponse, userResponse] = await Promise.all([addressPromise, record.update(data)])

    const updatedRecord = await db[this.model].findOne({
      where: {
        id: record.id
      },
      include
    })

    return {
      updatedResponse: updatedRecord.toJSONFor(),
      addressResponse: addressResponse !== undefined ? addressResponse.toJSONFor() : addressResponse,
      userResponse
    }
  }
}

export default UserService
