import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import * as statusCodes from '../constants/statusCodes'
import db from '../models'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import { decryptUUID } from '../utils/encryption'

dayjs.extend(utc)

const secretKey = String(process.env.MAGIC_LINK_SECRET_KEY)

const checkMagicLink = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { query: { token } } = req
  const userId = decryptUUID(token, 'base64', secretKey)

  const record = await db.User.findOne({
    attributes: { exclude: ['password'] },
    where: {
      id: userId
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

  const mininumWaitMinutes = Number(process.env.MAGIC_LINK_EXPIRATION ?? 10)
  const now = dayjs.utc()
  const createdAt = record.magicLink.createdAt
  const diff = now.diff(createdAt, 'minute')

  if (diff > mininumWaitMinutes) {
    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'Magic link has expired'
      }
    })
  }

  if ((record !== null) && record.magicLink.value === token) {
    await record.update({ magicLink: { usedAt: now } })
    req.user = record
    return next()
  }

  return res.status(statusCodes.UNAUTHORIZED).send({
    statusCode: statusCodes.UNAUTHORIZED,
    success: false,
    errors: {
      message: 'Magic Link is invalid'
    }
  })
}

export default checkMagicLink
