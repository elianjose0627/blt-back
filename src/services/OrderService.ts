import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateShippingAddressFilterQuery, generateInclude } from './BaseService'
import db from '../models'
import * as userRoles from '../utils/userRoles'
import * as appModules from '../utils/appModules'

class OrderService extends BaseService {
  async getAll (limit: number, offset: number, user?: any, search: string = '', filter = { firstname: '', lastname: '', email: '', city: '', country: '' }): Promise<any> {
    let records
    const allowedCompanyRoles = [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR]

    let where = generateShippingAddressFilterQuery(filter)
    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { 'shippingAddress.firstname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.lastname': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.email': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.company': { [Op.iLike]: `%${search}%` } },
              { 'shippingAddress.city': { [Op.iLike]: `%${search}%` } }
            ]
          },
          where
        ]
      }
    }

    if (user.role === userRoles.ADMIN) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where
      })
    } else if (allowedCompanyRoles.includes(user.role)) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          ...where,
          companyId: user.company.id
        }
      })
    } else {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: [] },
        where: {
          ...where,
          'shippingAddress.email': user.email
        }
      })
    }

    const companyId = user.company?.id
    const privacyRule = companyId !== undefined
      ? await db.PrivacyRule.findOne({
        where: {
          companyId,
          role: user.role,
          isEnabled: true,
          module: appModules.ORDERS
        }
      })
      : null

    const count = records.count

    records = records.rows.map((record: any) => {
      if (privacyRule !== null) {
        record.shippingAddress = {
          company: record.shippingAddress.company,
          lastname: record.shippingAddress.lastname,
          city: record.shippingAddress.city?.replace(/./g, '*'),
          email: record.shippingAddress.email?.replace(/.(?=.*@)/g, '*'),
          firstname: record.shippingAddress.firstname,
          street: record.shippingAddress.street?.replace(/./g, '*'),
          zip: record.shippingAddress.zip?.replace(/./g, '*'),
          country: record.shippingAddress.country
        }
      }
      return record.toJSONFor()
    })

    return {
      count,
      rows: records
    }
  }

  async insert (data: any): Promise<any> {
    const { order } = data
    let response: any

    response = await db[this.model].findOne({
      where: {
        outboundId: order.outboundId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...order })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    response = await db[this.model].create({ ...order, id: uuidv1() })

    return { response: response.toJSONFor(), status: 201 }
  }
}

export default OrderService
