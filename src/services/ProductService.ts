import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'

class ProductService extends BaseService {
  async insert (data: any): Promise<any> {
    const { company, product } = data
    let response: any

    const companyId = company?.id ?? product?.companyId ?? null

    response = await db[this.model].findOne({
      include: generateInclude(this.model),
      where: {
        jfsku: product.jfsku,
        companyId
      },
      paranoid: false // To get soft deleted record
    })

    if (response !== null) {
      await response.restore()
      const updatedResponse = await response.update({ ...product })
      return { response: updatedResponse.toJSONFor(company), status: 200 }
    }

    response = await db[this.model].create({ ...product, id: uuidv1(), companyId })

    return { response: response.toJSONFor(company), status: 201 }
  }

  async getAllForCompany (limit: number, offset: number, companyId: string): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      where: {
        companyId
      }
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAll (limit: number, offset: number): Promise<any> {
    const records = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: [] },
      include: [{
        model: db.Company,
        attributes: ['id', 'name', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      }]
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async searchCompanyProducts (limit: any, offset: any, companyId: string, searchString: string): Promise<any> {
    const products = await db[this.model].findAndCountAll({
      attributes: { exclude: ['companyId', 'deletedAt'] },
      where: {
        [Op.and]: [
          { companyId },
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${searchString}%` } },
              { jfsku: { [Op.iLike]: `%${searchString}%` } },
              { merchantSku: { [Op.iLike]: `%${searchString}%` } }
            ]
          }
        ]
      },
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    return products
  }

  async searchProducts (limit: any, offset: any, searchString: string): Promise<any> {
    const products = await db[this.model].findAndCountAll({
      attributes: { exclude: ['companyId', 'deletedAt'] },
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchString}%` } },
          { jfsku: { [Op.iLike]: `%${searchString}%` } },
          { merchantSku: { [Op.iLike]: `%${searchString}%` } }
        ]
      },
      limit,
      offset,
      order: [
        ['createdAt', 'DESC']
      ]
    })

    return products
  }
}

export default ProductService
