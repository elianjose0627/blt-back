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

dayjs.extend(utc)

const expiresIn = process.env.TOKEN_EXPIRATION

const appName = String(process.env.APP_NAME)
const appUrl = String(process.env.APP_URL)
const mailer = String(process.env.MAILER_EMAIL)
const salesMailer = String(process.env.SALES_MAILER_EMAIL)
const adminEmail = String(process.env.ADMIN_EMAIL)
const resetPasswordExpiration = '10 minutes'

const include = [
  {
    model: db.Company,
    attributes: ['id', 'name', 'email', 'phone', 'vat', 'domain'],
    as: 'company',
    include: [
      {
        model: db.Address,
        attributes: ['id', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition'],
        as: 'address'
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
    attributes: ['id', 'country', 'city', 'street', 'zip', 'addressAddition'],
    as: 'address'
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
    const { user, currentUser } = data
    const record = await db[this.model].create({ ...user, id: uuidv1() })

    const { email, firstName, role } = record

    let customMessage = `Thank you very much for registering an account at ${appName}.`
    if (currentUser?.role === userRoles.ADMIN) {
      customMessage = `<p>Your account has been created at ${appUrl} with a role of ${String(role)}.<p>
      <p>Your temporary password is: ${String(user.password)}.</p>`
    }
    const subject = `Verify your email for ${appName}`

    const steps = `
      <p>Steps to verify:</p>
      <ol>
        <li>Login to your account at ${appUrl}.</li>
        <li>Click on the profile picture at the top right corner of the screen and select "Profile".</li>
        <li>Under the Pending Actions Section, click "Request Verification OTP" to receive your code via email.</li>
      </ol>
      `

    const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      <br>
        Sales: ${salesMailer}
      </p>
      `

    const message = `<p>Hello ${String(firstName)},</p>
      <p>${customMessage}<br>
      To activate your account, please verify the ownership of the associated email address.</p>
      ${steps}
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

    await sendNotifierEmail(email, subject, message, false, message)

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
        const message = `Hello ${String(updatedRecord.firstName)}, your password for ${appName} App has been updated. \nIf you didn't ask to change your password, contact us immediately through ${adminEmail}. \n\nThanks,\n\n${appName} Application team`
        try {
          await sendNotifierEmail(updatedRecord.email, 'Password Change', message, bccStatus)
        } catch (error) {}

        return updatedRecord.toJSONFor()
      } else {
        return { message: 'Current password is incorrect' }
      }
    })
  }

  async forgotPassword (email: string): Promise<any> {
    const user = await db[this.model].findOne({
      where: {
        email
      }
    })

    if (user !== null) {
      const { firstName } = user
      const token = generateToken(user, 'reset', resetPasswordExpiration)
      const subject = `Reset password request for ${appName}`
      const steps = `
      <p>In order to reset your password please follow these steps:</p>
      <ol>
        <li>Go to <a href="${appUrl}/reset-password?token=${token}">link</a>. This link is going to be valid for ${resetPasswordExpiration}.</li>
        <li>Enter a new password for your account.</li>
      </ol>
      `

      const footer = `
      <p>For questions regarding your order, please reach out to:
      <br>
        Support: ${mailer}
      <br>
        Sales: ${salesMailer}
      </p>
      `

      const message = `<p>Hello ${String(firstName)},</p>
      ${steps}
      <p>Best Regards,<br>
      ${appName} team</p>
      <p>${footer}</p>
      `

      const info = await sendNotifierEmail(email, subject, message, false, message)

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
    const { email, firstName } = user
    const otp = generateOtp()

    const subject = `Verify your email for ${appName}`
    const steps = `
    <p>Steps to verify:</p>
    <ol>
      <li>Login to your account at ${appUrl}.</li>
      <li>Click on the profile picture at the top right corner of the screen and select "Profile".</li>
      <li>Under the Pending Actions Section, Enter your verification OTP <strong>${otp}</strong> and click "Verify Email".</li>
    </ol>
    `

    const footer = `
    <p>For questions regarding your order, please reach out to:
    <br>
      Support: ${mailer}
    <br>
      Sales: ${salesMailer}
    </p>
    `

    const message = `<p>Hello ${String(firstName)},</p>
    <p>You have requested a verification OTP to activate your account at ${appName}.<br>
    Your OTP is: <span style="font-size:1.5em;"><strong>${otp}</strong></span>
    </p>
    ${steps}
    <p>If you haven't requested a verification code or created an account at ${appName}, notify us: ${mailer}.</p>
    <p>Best Regards,<br>
    ${appName} team</p>
    <p>${footer}</p>
    `

    await user.update({ otp: { createdAt: dayjs.utc(), value: otp } })

    const info = await sendNotifierEmail(email, subject, message, false, message)

    if (info[0].statusCode === 202) {
      return info
    }

    return {
      status: 400,
      message: 'email was not sent'
    }
  }

  async searchUsers (limit: any, offset: any, email: string): Promise<any> {
    const users = await db[this.model].findAndCountAll({
      attributes: { exclude: ['password', 'otp'] },
      include,
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: `%${email}%` } }
        ]
      },
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    return users
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      include
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default UserService
