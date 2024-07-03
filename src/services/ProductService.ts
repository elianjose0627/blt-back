import { v1 as uuidv1 } from 'uuid'
import { Op, Sequelize } from 'sequelize'
import { Joi } from 'celebrate'
import BaseService, { generateFilterQuery, generateInclude, includeCompanyAndOwner } from './BaseService'
import db from '../models'
import axios from 'axios'
import { IProduct, IUser } from '../types'
import { Literal } from 'sequelize/types/utils'
import * as userRoles from '../utils/userRoles'
import { productDefaultColumns, productSelectedColumns } from '../utils/selectOptions'

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

const generateOrderBy = (orderBy: {[key: string]: string | number | undefined}): Array<[string | Literal, string]> => {
  const order: Array<[string | Literal, string]> = []
  Object.entries(orderBy).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      const ascOrDesc = (orderBy[key] as string).toUpperCase()
      if (key === 'price') {
        order.push([Sequelize.literal("CAST((\"Product\".\"netRetailPrice\"->>'amount') AS DOUBLE PRECISION)"), ascOrDesc])
      } else if (key === 'name') {
        order.push([Sequelize.literal('LOWER("Product"."name")'), ascOrDesc])
      } else {
        order.push([key, ascOrDesc])
      }
    }
  })
  if (order.length === 0) {
    order.push(['createdAt', 'DESC'])
  }
  return order
}

const order = [['createdAt', 'DESC']]
const generateIncludeCategoryAndTagAndProductAndGraduatedPriceAndProperties = (filterCategory: object, filterColor: object, filterMaterial: object, filterSize: object): object[] => {
  return (
    [
      {
        model: db.ProductCategory,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt']
        },
        as: 'productCategories',
        through: {
          attributes: []
        },
        where: filterCategory,
        required: Object.keys(filterCategory).length > 0 // Added so as to use a LEFT OUTER JOIN when filter is empty otherwise INNER JOIN
      },
      {
        model: db.Product,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'parentId', 'companyId', 'productColorId', 'productMaterialId', 'productSizeId', 'massUnitId', 'salesUnitId', 'taxRateId', 'productDetailId']
        },
        as: 'children',
        include: [
          {
            model: db.ProductColor,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt']
            },
            as: 'productColor'
          },
          {
            model: db.ProductMaterial,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt']
            },
            as: 'productMaterial'
          },
          {
            model: db.ProductSize,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt']
            },
            as: 'productSize'
          }
        ]
      },
      {
        model: db.ProductGraduatedPrice,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId']
        },
        as: 'graduatedPrices'
      },
      {
        model: db.ProductColor,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt']
        },
        as: 'productColor',
        where: filterColor,
        required: Object.keys(filterColor).length > 0
      },
      {
        model: db.ProductMaterial,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt']
        },
        as: 'productMaterial',
        where: filterMaterial,
        required: Object.keys(filterMaterial).length > 0
      },
      {
        model: db.ProductSize,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt']
        },
        as: 'productSize',
        where: filterSize,
        required: Object.keys(filterSize).length > 0
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
    filter = { isParent: false, category: '', minPrice: 0, maxPrice: 0, color: '', material: '', size: '', tags: '', showChildren: 'true', price: '' },
    orderBy = { name: '', createdAt: '', price: '' },
    select = productSelectedColumns
  ): Promise<any> {
    const { category, minPrice = 0, maxPrice = 0, color, material, size, tags, showChildren, price = '' } = filter

    const order = generateOrderBy(orderBy)

    const whereFilterCategory = generateFilterQuery({ name: category })
    const whereFilterTags = generateFilterQuery({ productCategoryTagId: tags }, 'in')
    const whereFilterColor = generateFilterQuery({ name: color })
    const whereFilterMaterial = generateFilterQuery({ name: material })
    const whereFilterSize = generateFilterQuery({ name: size })
    let whereFilterPrice: any = {}
    const where: any = {
      companyId,
      isVisible: true
    }
    const whereFilterShowChildren = showChildren === 'false' ? { parentId: { [Op.eq]: null } } : {}

    const attributes = select.replace(/\s+/g, '').split(',').concat(productDefaultColumns)
    const include: any[] = [
      ...generateIncludeCategoryAndTagAndProductAndGraduatedPriceAndProperties(whereFilterCategory, whereFilterColor, whereFilterMaterial, whereFilterSize),
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
        whereFilterTags,
        required: Object.keys(whereFilterTags).length > 0,
        attributes: {
          exclude: ['deletedAt', 'productId', 'productCategoryTagId']
        },
        as: 'productTags'
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
    filter = { isParent: 'true, false', category: '', minPrice: 0, maxPrice: 0, color: '', material: '', size: '', tags: '', showChildren: 'true', price: '' },
    orderBy = { name: '', createdAt: '', price: '' },
    select = productSelectedColumns
  ): Promise<any> {
    const {
      isParent = 'true, false', category, minPrice = 0, maxPrice = 0,
      color, material, size, tags, showChildren, price = ''
    } = filter

    const order = generateOrderBy(orderBy)

    const whereSearch: any = {}
    const whereFilterCategory = generateFilterQuery({ name: category }, 'in')
    const whereFilterTags = generateFilterQuery({ productCategoryTagId: tags }, 'in')
    const whereFilterColor = generateFilterQuery({ name: color })
    const whereFilterMaterial = generateFilterQuery({ name: material })
    const whereFilterSize = generateFilterQuery({ name: size })
    let whereFilterPrice: any = {}
    const whereFilterShowChildren = showChildren === 'false' ? { parentId: { [Op.eq]: null } } : {}

    const attributes = select.replace(/\s+/g, '').split(',').concat(productDefaultColumns)
    const include: any[] = [
      {
        model: db.Company,
        attributes: ['id', 'name', 'suffix', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      },
      ...generateIncludeCategoryAndTagAndProductAndGraduatedPriceAndProperties(whereFilterCategory, whereFilterColor, whereFilterMaterial, whereFilterSize),
      {
        model: db.ProductTag,
        include: [
          {
            model: db.ProductCategoryTag,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productCategoryId']
            },
            as: 'productCategoryTag'
          }
        ],
        whereFilterTags,
        required: Object.keys(whereFilterTags).length > 0,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId', 'productCategoryTagId']
        },
        as: 'productTags'
      }
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

  async getCatalogue (
    accessProductCategoryTags: string[],
    user: IUser,
    limit: number, offset: number, search: string = '',
    filter = { isParent: 'true, false', category: '', minPrice: 0, maxPrice: 0, color: '', material: '', size: '', tags: '', showChildren: 'true', price: '' },
    orderBy = { name: '', createdAt: '', price: '' },
    select = productSelectedColumns
  ): Promise<any> {
    const {
      isParent = 'true, false', category, minPrice = 0, maxPrice = 0,
      color, material, size, tags, showChildren, price = ''
    } = filter

    const role = user.role

    const order = generateOrderBy(orderBy)

    const whereSearch: any = {}
    const whereFilterCategory = generateFilterQuery({ name: category }, 'in')
    const whereFilterTags = generateFilterQuery({ productCategoryTagId: tags }, 'in')
    const whereFilterColor = generateFilterQuery({ name: color })
    const whereFilterMaterial = generateFilterQuery({ name: material })
    const whereFilterSize = generateFilterQuery({ name: size })
    let whereFilterPrice: any = {}
    const whereFilterShowChildren = showChildren === 'false' ? { parentId: { [Op.eq]: null } } : {}

    const attributes = select.replace(/\s+/g, '').split(',').concat(productDefaultColumns)
    const extrafilterTag = {
      [Op.and]: [
        whereFilterTags,
        {
          productCategoryTagId: {
            [Op.in]: accessProductCategoryTags
          }
        }
      ]
    }

    const include: any[] = [
      {
        model: db.Company,
        attributes: ['id', 'name', 'suffix', 'email', 'phone', 'vat', 'domain'],
        as: 'company'
      },
      ...generateIncludeCategoryAndTagAndProductAndGraduatedPriceAndProperties(whereFilterCategory, whereFilterColor, whereFilterMaterial, whereFilterSize),
      {
        model: db.ProductTag,
        include: [
          {
            model: db.ProductCategoryTag,
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productCategoryId']
            },
            as: 'productCategoryTag'
          }
        ],
        where: role === userRoles.ADMIN ? whereFilterTags : extrafilterTag,
        required: role === userRoles.ADMIN ? (Object.keys(whereFilterTags).length > 0) : true,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId', 'productCategoryTagId']
        },
        as: 'productTags'
      }
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

  async getCatalogueSingle (id: string): Promise<any> {
    const product = await db.Product.findOne({
      include: [
        includeCompanyAndOwner,
        {
          model: db.ProductCategory,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productCategories',
          through: {
            attributes: []
          }
        },
        {
          model: db.ProductTag,
          include: [
            {
              model: db.ProductCategoryTag,
              attributes: ['id', 'name'],
              as: 'productCategoryTag',
              required: true,
              include: [
                {
                  model: db.ProductTag,
                  attributes: ['productId'],
                  as: 'relatedProducts',
                  limit: 6,
                  include: [
                    {
                      model: db.Product,
                      attributes: ['name', 'pictures'],
                      as: 'product'
                    }
                  ]
                }
              ]
            }
          ],
          attributes: ['id'],
          as: 'productTags'
        },
        {
          model: db.Product,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt', 'parentId', 'productCategoryId', 'companyId', 'productColorId', 'productMaterialId', 'productSizeId', 'massUnitId', 'salesUnitId', 'taxRateId', 'productDetailId']
          },
          as: 'children',
          include: [
            {
              model: db.ProductColor,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt']
              },
              as: 'productColor'
            },
            {
              model: db.ProductMaterial,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt']
              },
              as: 'productMaterial'
            },
            {
              model: db.ProductSize,
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt']
              },
              as: 'productSize'
            }
          ]
        },
        {
          model: db.ProductGraduatedPrice,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt', 'productId']
          },
          as: 'graduatedPrices'
        },
        {
          model: db.ProductColor,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productColor'
        },
        {
          model: db.ProductMaterial,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productMaterial'
        },
        {
          model: db.ProductSize,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productSize'
        }
      ],
      where: {
        id
      }
    })

    return product
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

  async getProductVariations (limit: number, offset: number, parentId: string): Promise<any> {
    const response = await db[this.model].findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'deletedAt', 'parentId', 'productCategoryId', 'companyId', 'productColorId', 'productMaterialId', 'productSizeId', 'massUnitId', 'salesUnitId', 'taxRateId', 'productDetailId']
      },
      where: {
        parentId,
        [Op.not]: {
          parentId: null
        }
      },
      include: [
        {
          model: db.ProductColor,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productColor'
        },
        {
          model: db.ProductMaterial,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productMaterial'
        },
        {
          model: db.ProductSize,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt']
          },
          as: 'productSize'
        }
      ]
    })
    return response
  }
}

export default ProductService
