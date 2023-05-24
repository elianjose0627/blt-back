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

  async getAllForCompany (limit: number, offset: number, companyId: string, search: string = ''): Promise<any> {
    const where: any = {
      companyId
    }
    const order = [['createdAt', 'DESC']]
    const attributes: any = { exclude: [] }
    const include: any[] = [
      {
        model: db.Stock,
        attributes: { exclude: ['deletedAt', 'productId'] },
        as: 'stock'
      }
    ]

    if (search !== '') {
      where[Op.and] = [
        {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { jfsku: { [Op.iLike]: `%${search}%` } },
            { merchantSku: { [Op.iLike]: `%${search}%` } }
          ]
        }
      ]
    }

    const records = await db[this.model].findAndCountAll({
      attributes,
      include,
      where,
      limit,
      offset,
      order
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAll (limit: number, offset: number, search: string = ''): Promise<any> {
    const where: any = {}
    const order = [['createdAt', 'DESC']]
    const attributes: any = { exclude: [] }
    const include: any[] = [
      {
        model: db.Company,
        attributes: ['id', 'name', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      },
      {
        model: db.Stock,
        attributes: { exclude: ['deletedAt', 'productId'] },
        as: 'stock'
      }
    ]

    if (search !== '') {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { jfsku: { [Op.iLike]: `%${search}%` } },
        { merchantSku: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const records = await db[this.model].findAndCountAll({
      attributes,
      include,
      where,
      limit,
      offset,
      order
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }
}

export default ProductService
