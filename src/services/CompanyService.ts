import { v1 as uuidv1 } from 'uuid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Op } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import * as userRoles from '../utils/userRoles'
import * as appModules from '../utils/appModules'

dayjs.extend(utc)

class CompanyService extends BaseService {
  manyRecords (): string {
    return 'companies'
  }

  async getAll (limit: number, offset: number, user?: any, search?: string): Promise<any> {
    let records
    let where

    if (search !== undefined) {
      where = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${search}%` } },
          { name: { [Op.iLike]: `%${search}%` } },
          { domain: { [Op.iLike]: `%${search}%` } },
          { vat: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }

    const now = dayjs().utc().toDate()

    const include = [
      {
        model: db.SecondaryDomain,
        attributes: { exclude: ['companyId', 'deletedAt'] },
        as: 'secondaryDomains'
      },
      {
        model: db.AccessPermission,
        attributes: { exclude: ['companyId', 'deletedAt', 'createdAt', 'updatedAt', 'isEnabled'] },
        as: 'accessPermissions'
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

    if (user.role === userRoles.ADMIN) {
      records = await db[this.model].findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        include,
        distinct: true,
        where
      })
    } else {
      records = await db[this.model].findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          userId: user.id,
          ...where
        },
        include,
        distinct: true
      })
    }

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async insert (data: any): Promise<any> {
    const { user, company } = data
    let response: any

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        name: company.name,
        email: company.email,
        userId: user.id
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...company })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...company, id: uuidv1(), userId: user.id })

    return { response: response.toJSONFor(user), status: 201 }
  }

  async getAllUsers (limit: number, offset: number, companyId: string, user: any): Promise<any> {
    const records = await db.User.findAndCountAll({
      limit,
      offset,
      where: {
        companyId,
        isGhost: false
      },
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      include: [
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
      ],
      distinct: true
    })

    const privacyRule = await db.PrivacyRule.findOne({
      where: {
        companyId,
        role: user.role,
        isEnabled: true,
        module: appModules.ADDRESSES
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => {
        if (privacyRule !== null && record.addresses !== null) {
          record.addresses = record.addresses.map((address: any) => ({
            phone: address.phone?.replace(/./g, '*'),
            addressAddition: address.addressAddition?.replace(/./g, '*'),
            city: address.city.replace(/./g, '*'),
            street: address.street?.replace(/./g, '*'),
            zip: address.zip?.replace(/./g, '*'),
            country: address.country.replace(/./g, '*')
          }))
        }
        const item = record.toJSONFor()
        delete item.isGhost
        return item
      })
    }
  }
}

export default CompanyService
