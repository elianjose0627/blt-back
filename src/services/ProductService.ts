import { v1 as uuidv1 } from 'uuid'
import { Op } from 'sequelize'
import { Joi } from 'celebrate'
import BaseService, { generateFilterQuery, generateInclude } from './BaseService'
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

const generatePriceRangesQuery = (priceRanges: string[]): any[] => priceRanges.map(range => {
  const [minPrice, maxPrice] = range.split('-').map(Number)
  return {
    'netRetailPrice.amount': {
      [Op.between]: [minPrice, maxPrice]
    }
  }
})

const order = [['createdAt', 'DESC']]
const generateIncludeCategoryTagProduct = (filterCategory: object, filterTag: object): object[] => {
  return (
    [
      {
        model: db.ProductCategory,
        attributes: {
          exclude: ['deletedAt']
        },
        as: 'productCategory',
        where: filterCategory,
        required: Object.keys(filterCategory).length > 0 // Added so as to use a LEFT OUTER JOIN when filter is empty otherwise INNER JOIN
      },
      {
        model: db.ProductTag,
        include: [
          {
            model: db.ProductCategoryTag,
            attributes: {
              exclude: ['deletedAt', 'productCategoryId']
            },
            as: 'productCategoryTag'
          }
        ],
        where: filterTag,
        required: Object.keys(filterTag).length > 0,
        attributes: {
          exclude: ['deletedAt', 'productId', 'productCategoryTagId']
        },
        as: 'productTags'
      },
      {
        model: db.Product,
        attributes: {
          exclude: ['deletedAt', 'parentId', 'productCategoryId', 'companyId']
        },
        as: 'children'
      }
    ]
  )
}

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

  async getAllForCompany (
    limit: number, offset: number, companyId: string, search: string = '',
    filter = { isParent: false, category: '', minPrice: 0, maxPrice: 0, color: '', material: '', size: '', tags: '', showChildren: 'true', price: '' }
  ): Promise<any> {
    const { category, minPrice = 0, maxPrice = 0, color, material, size, tags, showChildren, price = '' } = filter

    const whereFilterCategory = generateFilterQuery({ name: category })
    const whereFilterTags = generateFilterQuery({ productCategoryTagId: tags }, 'in')
    let whereFilterPrice: any = {}
    const where: any = {
      companyId,
      isVisible: true
    }
    const wherePropertiesFilter = generateFilterQuery({
      'properties.color': color,
      'properties.material': material,
      'properties.size': size
    })
    const whereFilterShowChildren = showChildren === 'false' ? { parentId: { [Op.eq]: null } } : {}

    const attributes: any = { exclude: [] }
    const include: any[] = [
      ...generateIncludeCategoryTagProduct(whereFilterCategory, whereFilterTags)
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

    if (maxPrice > 0) {
      whereFilterPrice = { 'netRetailPrice.amount': { [Op.between]: [minPrice, maxPrice] } }
    }

    if (price !== '') {
      const priceRanges = price.split(',')

      const filterQueries = generatePriceRangesQuery(priceRanges)
      whereFilterPrice[Op.or] = filterQueries
    }

    const records = await db[this.model].findAndCountAll({
      attributes,
      include,
      where: {
        ...where,
        ...whereFilterPrice,
        ...wherePropertiesFilter,
        ...whereFilterShowChildren
      },
      limit,
      offset,
      order,
      distinct: true
    })

    return {
      count: records.count,
      rows: records.rows.map((record: any) => record.toJSONFor())
    }
  }

  async getAll (
    limit: number, offset: number, search: string = '',
    filter = { isParent: 'true, false', category: '', minPrice: 0, maxPrice: 0, color: '', material: '', size: '', tags: '', showChildren: 'true', price: '' }
  ): Promise<any> {
    const {
      isParent = 'true, false', category, minPrice = 0, maxPrice = 0,
      color, material, size, tags, showChildren, price = ''
    } = filter

    const whereSearch: any = {}
    const whereFilterCategory = generateFilterQuery({ name: category }, 'in')
    const whereFilterTags = generateFilterQuery({ productCategoryTagId: tags }, 'in')
    let whereFilterPrice: any = {}
    const wherePropertiesFilter = generateFilterQuery({
      'properties.color': color,
      'properties.material': material,
      'properties.size': size
    })
    const whereFilterShowChildren = showChildren === 'false' ? { parentId: { [Op.eq]: null } } : {}

    const attributes: any = { exclude: [] }
    const include: any[] = [
      {
        model: db.Company,
        attributes: ['id', 'name', 'suffix', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      },
      ...generateIncludeCategoryTagProduct(whereFilterCategory, whereFilterTags)
    ]

    if (search !== '') {
      whereSearch[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { jfsku: { [Op.iLike]: `%${search}%` } },
        { merchantSku: { [Op.iLike]: `%${search}%` } }
      ]
    }

    if (maxPrice > 0) {
      whereFilterPrice = { 'netRetailPrice.amount': { [Op.between]: [minPrice, maxPrice] } }
    }

    if (price !== '') {
      const priceRanges = price.split(',')

      const filterQueries = generatePriceRangesQuery(priceRanges)
      whereFilterPrice[Op.or] = filterQueries
    }

    const records = await db[this.model].findAndCountAll({
      attributes,
      include,
      where: {
        ...whereSearch,
        isParent: {
          [Op.in]: isParent.split(',')
        },
        ...whereFilterPrice,
        ...wherePropertiesFilter,
        ...whereFilterShowChildren
      },
      limit,
      offset,
      order,
      distinct: true
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

  async findParentsOrChildren (ids: string[], isParent: boolean): Promise<any> {
    const products = await db.Product.findAndCountAll({
      attributes: ['id'],
      where: {
        id: {
          [Op.in]: ids
        },
        isParent
      }
    })

    return products
  }

  async updateChildren (ids: string[], parentId: string | null): Promise<any> {
    const response = await db.Product.update({ parentId }, {
      where: {
        id: {
          [Op.in]: ids
        }
      },
      returning: true
    })
    return response
  }
}

export default ProductService
