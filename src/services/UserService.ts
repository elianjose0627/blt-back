import { Op } from 'sequelize'
import db from '../models'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BaseService from './BaseService'
import { sendNotifierEmail } from '../utils/sendMail'
import generateToken from '../utils/generateToken'
import generateOtp from '../utils/generateOtp'

dayjs.extend(utc)

const expiresIn = process.env.TOKEN_EXPIRATION

const appName = String(process.env.APP_NAME)
const adminEmail = String(process.env.ADMIN_EMAIL)

const include = [
  {
    model: db.Company,
    attributes: ['id', 'name', 'email'],
    as: 'company'
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
      const otp = generateOtp()
      const subject = `Reset your password for ${appName}`
      const message = `Hello ${String(user.firstName)},\n\nYour OTP is ${otp}.\nOpen the app and go to Sign In Page.\nClick the Forgot your password link.\nOn the Restore Password Page, click the Enter OTP link and enter the code you received on your email.\n\nIf you didn’t ask to reset your password, you can ignore this email.\n\nThanks,\n\n${appName} team`

      await user.update({ otp: { createdAt: dayjs.utc(), value: otp } })

      const info = await sendNotifierEmail(email, subject, message)

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
    const message = `Hello ${String(firstName)},\n\nYour OTP is ${otp}.\nOpen the app and make sure you are logged in.\nClick on the profile picture at the top of the screen.\nSelect Verify, and enter the code you received on your email.\n\nIf you didn’t ask to reset your password, you can ignore this email.\n\nThanks,\n\n${appName} team`

    await user.update({ otp: { createdAt: dayjs.utc(), value: otp } })

    const info = await sendNotifierEmail(email, subject, message)

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
}

export default UserService
