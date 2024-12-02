import passport from 'passport'
import { Op } from 'sequelize'
import bcrypt from 'bcrypt'
import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import db from '../models'
import dayjs from 'dayjs'

const checkAuth = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  // Check for the presence of a custom secret key
  const authHeader = req.headers.authorization
  const apiKeyId = req.headers['x-api-key-id']
  const now = dayjs().utc().toDate()

  const hasCustomToken = authHeader?.startsWith('Endeavour ')

  if (authHeader !== undefined && hasCustomToken === true && apiKeyId !== undefined) {
    const secretKey = authHeader.split(' ')[1]

    db.ApiKey.findOne({
      where: {
        id: apiKeyId,
        isEnabled: true,
        validFrom: { [Op.lte]: now },
        validTo: { [Op.or]: [{ [Op.gte]: now }, { [Op.eq]: null }] },
        revokedAt: { [Op.or]: [{ [Op.eq]: null }, { [Op.gt]: now }] }
      },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: { exclude: ['password'] },
          include: [
            {
              model: db.Company,
              attributes: ['id', 'customerId', 'name', 'suffix', 'email', 'phone', 'vat', 'domain', 'isDomainVerified', 'theme', 'logo'],
              as: 'company',
              include: [
                {
                  model: db.Address,
                  attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'userId', 'companyId'] },
                  as: 'addresses',
                  where: {
                    [Op.or]: [
                      { affiliation: { [Op.eq]: null } },
                      { affiliation: 'company' }
                    ]
                  },
                  required: false
                },
                {
                  model: db.User,
                  attributes: ['id', 'firstName', 'lastName', 'email'],
                  as: 'owner'
                },
                {
                  model: db.AccessPermission,
                  attributes: { exclude: ['companyId', 'deletedAt', 'createdAt', 'updatedAt', 'isEnabled'] },
                  as: 'accessPermissions',
                  where: {
                    isEnabled: true
                  },
                  required: false
                },
                {
                  model: db.CompanySubscription,
                  attributes: { exclude: ['companyId', 'deletedAt'] },
                  as: 'subscriptions',
                  where: {
                    paymentStatus: 'paid',
                    endDate: {
                      [Op.gte]: now
                    }
                  },
                  required: false
                }
              ]
            },
            {
              model: db.Address,
              attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt', 'userId', 'companyId'] },
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
        }
      ]
    }).then((apiKey: any) => {
      if (apiKey === null) {
        return res.status(statusCodes.UNAUTHORIZED).send({
          statusCode: statusCodes.UNAUTHORIZED,
          success: false,
          errors: {
            message: 'Invalid API key'
          }
        })
      }
      const hashedSecretKey = apiKey.secretKey
      const isSecretKeyValid = bcrypt.compareSync(secretKey, hashedSecretKey)
      if (isSecretKeyValid) {
        req.user = apiKey.user
        req.apiKeyPermissions = apiKey.permissions
        return next()
      } else {
        return res.status(statusCodes.UNAUTHORIZED).send({
          statusCode: statusCodes.UNAUTHORIZED,
          success: false,
          errors: {
            message: 'Invalid API key'
          }
        })
      }
    }).catch(() => {
      return res.status(statusCodes.BAD_REQUEST).send({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: 'Invalid API key'
        }
      })
    })
  } else {
    passport.authenticate('jwt', { session: false }, function (err, user, info) {
      if (err !== null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: err.message
          }
        })
      }

      if (user !== false) {
        req.user = user
        return next()
      }

      return res.status(statusCodes.UNAUTHORIZED).send({
        statusCode: statusCodes.UNAUTHORIZED,
        success: false,
        errors: {
          message: info.message
        }
      })
    })(req, res, next)
  }
}

export default checkAuth
