
import { Op } from 'sequelize'
import db from '../models'
import BaseService, { generateInclude } from './BaseService'
import * as userRoles from '../utils/userRoles'

class PackingSlipService extends BaseService {
  async getAll (limit: number, offset: number, user?: any, search?: string, sortBy = { createdAt: 'DESC', dueDate: '', documentDate: '' }, filter?: string): Promise<any> {
    const allowedCompanyRoles = [userRoles.COMPANYADMINISTRATOR]
    let records
    let where

    const generateOrder = (sortBy: object): string[][] => {
      return Object.entries(sortBy)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => [key, value])
    }

    const order = generateOrder(sortBy)

    if (search !== undefined && search !== '') {
      where = {
        [Op.and]: [
          {
            [Op.or]: [
              { postedOrderId: { [Op.iLike]: `%${search}%` } },
              { status: { [Op.iLike]: `%${search}%` } }
            ]
          }
        ]
      }
    }

    if (user.role === userRoles.ADMIN) {
      records = await db[this.model].findAndCountAll({
        include: generateInclude(this.model),
        limit,
        offset,
        order,
        attributes: { exclude: [] },
        where,
        distinct: true
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
        },
        distinct: true
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
          userId: user.id
        },
        distinct: true
      })
    }
    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default PackingSlipService
