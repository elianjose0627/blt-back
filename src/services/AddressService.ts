import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateFilterQuery } from './BaseService'
import db from '../models'

class AddressService extends BaseService {
  manyRecords (): string {
    return 'addresses'
  }

  async insert (data: any): Promise<any> {
    const { user, company, address } = data
    let response: any

    const addressConditions = []

    Object.keys(address).forEach(key => {
      addressConditions.push({ [key]: address[key] })
    })

    addressConditions.push({ companyId: company?.id ?? null })
    addressConditions.push({ userId: user?.id ?? null })

    response = await db[this.model].findOne({
      where: {
        [Op.and]: addressConditions
      },
      paranoid: false
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...address })
      return { response: updatedResponse.toJSONFor(), status: 200 }
    }

    if (company !== null) {
      response = await db[this.model].create({ ...address, id: uuidv1(), companyId: company.id })
    } else {
      response = await db[this.model].create({ ...address, id: uuidv1(), userId: user?.id })
    }

    return { response: response.toJSONFor(user), status: 201 }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string, search: string, filter = { type: 'billing,delivery,billingAndDelivery,return' }): Promise<any> {
    let where
    const { type } = filter
    if (search !== undefined) {
      where = {
        [Op.or]: [
          { country: { [Op.iLike]: `%${search}%` } },
          { city: { [Op.iLike]: `%${search}%` } },
          { street: { [Op.iLike]: `%${search}%` } },
          { zip: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { companyName: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }
    const whereFilterTypes = generateFilterQuery({ type }, 'in')
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        companyId,
        type: type.split(','),
        ...where,
        ...whereFilterTypes
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAllForUser (limit: number, offset: number, userId: string, search: string, filter = { type: 'billing,delivery,billingAndDelivery,return' }): Promise<any> {
    let where
    const { type } = filter
    if (search !== undefined) {
      where = {
        [Op.or]: [
          { country: { [Op.iLike]: `%${search}%` } },
          { city: { [Op.iLike]: `%${search}%` } },
          { street: { [Op.iLike]: `%${search}%` } },
          { zip: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { companyName: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } }
        ]
      }
    }
    const whereFilterTypes = generateFilterQuery({ type }, 'in')
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        userId,
        type: type.split(','),
        ...where,
        ...whereFilterTypes
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default AddressService
