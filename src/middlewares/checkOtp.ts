import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import * as statusCodes from '../constants/statusCodes'
import db from '../models'
import { CustomNext, CustomRequest, CustomResponse } from '../types'

dayjs.extend(utc)

const checkOtp = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { body: { user: { email, otp } } } = req
  const record = await db.User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      email
    }
  })

  if (record === null) {
    return res.status(statusCodes.NOT_FOUND).send({
      statusCode: statusCodes.NOT_FOUND,
      success: false,
      errors: {
        message: 'User not found'
      }
    })
  }

  const mininumWaitMinutes = Number(process.env.OTP_EXPIRATION) ?? 2
  const now = dayjs.utc()
  const createdAt = record.otp.createdAt
  const diff = now.diff(createdAt, 'minute')

  if (diff > mininumWaitMinutes) {
    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'OTP has expired'
      }
    })
  }

  if ((record !== null) && record.otp.value === otp) {
    req.user = record
    return next()
  }

  return res.status(statusCodes.UNAUTHORIZED).send({
    statusCode: statusCodes.UNAUTHORIZED,
    success: false,
    errors: {
      message: 'OTP is invalid'
    }
  })
}

export default checkOtp
