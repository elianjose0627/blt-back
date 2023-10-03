import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import axios from 'axios'
import { IProduct } from '../types'

const order = [['createdAt', 'DESC']]

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
    const attributes: any = { exclude: [] }
    const include: any[] = []

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
    const attributes: any = { exclude: [] }
    const include: any[] = [
      {
        model: db.Company,
        attributes: ['id', 'name', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
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

  async getProductStock (product: IProduct): Promise<any> {
    const baseURL = process.env.JTL_API_URL as string

    const apiClient: any = axios.create({
      baseURL: `${baseURL}/api/v1/merchant`,
      withCredentials: false,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    const token = await db.Token.findOne()
    const { accessToken } = token
    apiClient.defaults.headers.common.Authorization = `Bearer ${String(accessToken)}`

    const { data } = await apiClient.get(`/stocks/${String(product.jfsku)}`)

    return data
  }

  async getProductOutbounds (offset: number, product: IProduct): Promise<any> {
    const records = await db.Order.findAndCountAll({
      attributes: { exclude: ['attributes', 'deletedAt'] },
      offset,
      order,
      where: {
        items: {
          [Op.contains]: [{ jfsku: product.jfsku }]
        }
      }
    })

    return records
  }
}

export default ProductService
