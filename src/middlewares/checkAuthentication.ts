import { Op } from 'sequelize'
import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import db from '../models'
import { decodeString } from '../utils/encryption'

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
    as: 'addresses',
    where: {
      [Op.or]: [
        { affiliation: { [Op.eq]: null } },
        { affiliation: 'personal' }
      ]
    },
    required: false
  }
]

const checkAuthentication = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const authHeader = req.headers.authorization
  const hasCustomBasicAuth = authHeader?.startsWith('Basic ')

  if (authHeader !== undefined && hasCustomBasicAuth === true) {
    const secretKey = authHeader.split(' ')[1]
    const username = decodeString(secretKey, 'base64').split(':')[0]
    const password = decodeString(secretKey, 'base64').split(':')[1]
    db.User.findOne({
      include,
      where: {
        username
      }
    }).then((user: any) => {
      if (user !== null) {
        user.comparePassword(password, async (match: boolean) => {
          if (match) {
            req.user = user
            req.apiKeyPermissions = user.permissions
            return next()
          } else {
            return res.status(statusCodes.UNAUTHORIZED).send({
              statusCode: statusCodes.UNAUTHORIZED,
              success: false,
              errors: {
                message: 'Invalid Username or Password'
              }
            })
          }
        })
      } else {
        return res.status(statusCodes.UNAUTHORIZED).send({
          statusCode: statusCodes.UNAUTHORIZED,
          success: false,
          errors: {
            message: 'Invalid Username or Password'
          }
        })
      }
    }).catch((error: any) => {
      return res.status(statusCodes.SERVER_ERROR).send({
        statusCode: statusCodes.SERVER_ERROR,
        success: false,
        errors: {
          message: error.message
        }
      })
    })
  } else {
    return res.status(statusCodes.UNAUTHORIZED).send({
      statusCode: statusCodes.UNAUTHORIZED,
      success: false,
      errors: {
        message: 'Invalid Auth Type'
      }
    })
  }
}

export default checkAuthentication
