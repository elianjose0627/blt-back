import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import { Joi } from 'celebrate'
import BaseService, { generateInclude } from './BaseService'
import db from '../models'
import axios from 'axios'
import { IProduct } from '../types'

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
      companyId,
      isVisible: true
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
        attributes: ['id', 'name', 'suffix', 'email', 'phone', 'vat', 'domain'],
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
    const token = await db.Token.findOne()
    const { accessToken } = token
    apiClient.defaults.headers.common.Authorization = `Bearer ${String(accessToken)}`

    const { data } = await apiClient.get(`/stocks/${String(product.jfsku)}`)

    return data
  }

  async getProductOutbounds (limit: number, offset: number, product: IProduct): Promise<any> {
    const records = await db.Order.findAndCountAll({
      attributes: { exclude: ['attributes', 'deletedAt'] },
      limit,
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

  async getProductInbounds (limit: number, offset: number, product: IProduct): Promise<any> {
    const token = await db.Token.findOne()
    const { accessToken } = token
    apiClient.defaults.headers.common.Authorization = `Bearer ${String(accessToken)}`

    const config = {
      params: {
        $top: limit,
        $skip: offset,
        $orderBy: 'modificationInfo/createdAt desc',
        $filter: `items/any(a:contains(a/jfsku, '${String(product.jfsku)}'))`
      }
    }

    const { data } = await apiClient.get('/inbounds', config)

    return data
  }

  async get (id: string): Promise<any> {
    const { error } = Joi.string().guid().validate(id)

    const where = error === undefined ? { id } : { jfsku: id }

    const product = await db.Product.findOne({
      include: generateInclude(this.model),
      where
    })

    return product
  }
}

export default ProductService
