import BaseController from './BaseController'
import ProductService from '../services/ProductService'
import CompanyService from '../services/CompanyService'
import ProductGraduatedPriceService from '../services/ProductGraduatedPriceService'
import ProductTagService from '../services/ProductTagService'
import type { CustomNext, CustomRequest, CustomResponse, IProduct, IProductTag, StatusCode } from '../types'
import { io } from '../utils/socket'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'

const productService = new ProductService('Product')
const companyService = new CompanyService('Company')
const productGraduatedPriceService = new ProductGraduatedPriceService('ProductGraduatedPrice')
const productTagService = new ProductTagService('ProductTag')

class ProductController extends BaseController {
  async checkRecord (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> {
    const { params: { id }, accessProductCategoryTags, user } = req
    let record

    if (accessProductCategoryTags !== undefined) {
      record = await productService.getCatalogueSingle(id)
      if (record !== null) {
        const { productTags }: { productTags: IProductTag[] } = record
        const productCategoryTags = productTags.map(tag => tag.productCategoryTag.id)

        const hasAccess = productCategoryTags.some(tag => accessProductCategoryTags.includes(tag))
        if (user.role !== userRoles.ADMIN && !hasAccess) {
          return res.status(statusCodes.FORBIDDEN).send({
            statusCode: statusCodes.FORBIDDEN,
            success: false,
            errors: {
              message: 'You do not have access to this product in the catalogue'
            }
          })
        }
      }
    } else {
      record = await productService.get(id)
    }

    if (record === null) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Product not found'
        }
      })
    }
    req.record = record
    return next()
  }

  checkOwnerOrAdminOrEmployee (req: CustomRequest, res: CustomResponse, next: CustomNext): any {
    const { user: currentUser, record: { companyId, company } } = req

    const isOwnerOrAdmin = currentUser.id === company?.owner?.id || currentUser.role === userRoles.ADMIN
    const isEmployee = Boolean(companyId) && currentUser?.companyId === companyId

    if (isOwnerOrAdmin || (isEmployee)) {
      req.isOwnerOrAdmin = isOwnerOrAdmin
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'Only the owner, admin or employee can perform this action'
        }
      })
    }
  }

  async insert (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: company, body: { product } } = req

    // Used != to capture value that is undefined
    if (product?.companyId != null) {
      const company = await companyService.findById(product.companyId)
      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: 'Company not found'
          }
        })
      }
    }

    const { response, status } = await productService.insert({ company, product })

    io.emit(`${String(this.recordName())}`, { message: `${String(this.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [this.service.singleRecord()]: response
    })
  }

  async get (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [this.recordName()]: record.toJSONFor()
    })
  }

  async getAll (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search, filter, orderBy, select }, accessProductCategoryTags, user } = req
    let records

    if (accessProductCategoryTags === undefined) {
      records = await productService.getAll(limit, offset, search, filter, orderBy, select)
    } else {
      records = await productService.getCatalogue(accessProductCategoryTags, user, limit, offset, search, filter, orderBy, select)
    }

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [productService.manyRecords()]: records.rows
    })
  }

  async getAllForCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { limit, page, offset, search, filter, orderBy, select } } = req
    const { id } = req.params
    const records = await productService.getAllForCompany(limit, offset, id, search, filter, orderBy, select)

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [productService.manyRecords()]: records.rows
    })
  }

  async getProductStock (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product } = req
    const stock = await productService.getProductStock(product)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      stock
    })
  }

  async getProductOutbounds (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product, query: { limit, page, offset } } = req
    const records = await productService.getProductOutbounds(limit, offset, product)

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      outbounds: records.rows
    })
  }

  async getProductInbounds (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product, query: { limit, page, offset } } = req
    const records = await productService.getProductInbounds(limit, offset, product)

    const meta = {
      total: records.count,
      pageCount: Math.ceil(records.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      inbounds: records.items
    })
  }

  async updateProductCompany (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { product: { companyId } } } = req

    if (companyId !== null) {
      const company = await companyService.findById(companyId)
      if (company === null) {
        return res.status(statusCodes.NOT_FOUND).send({
          statusCode: statusCodes.NOT_FOUND,
          success: false,
          errors: {
            message: 'Company not found'
          }
        })
      }
    }
    const updatedRecord = await productService.update(record, { companyId })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      product: updatedRecord
    })
  }

  async updateChild (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { product: { parentId } } } = req

    const foundParents = await productService.findParentsOrChildren([parentId], true)

    if (foundParents.count === 0) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Parent product not found'
        }
      })
    }

    const response = await productService.update(record, { parentId })

    io.emit(`${String(productService.recordName())}`, { message: `${String(productService.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [productService.singleRecord()]: response
    })
  }

  async removeChild (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record } = req

    const response = await productService.update(record, { parentId: null })

    io.emit(`${String(productService.recordName())}`, { message: `${String(productService.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [productService.singleRecord()]: response
    })
  }

  async updateChildren (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record, body: { product: { childIds } }, params: { id: productId } } = req

    const foundParents = await productService.findParentsOrChildren([productId], true)

    if (foundParents.count === 0) {
      return res.status(statusCodes.NOT_FOUND).send({
        statusCode: statusCodes.NOT_FOUND,
        success: false,
        errors: {
          message: 'Parent product not found'
        }
      })
    }

    const { rows } = await productService.findParentsOrChildren(childIds, false)
    const originalChildrenIds: string[] = record.children.map((child: IProduct) => child.id)
    const foundChildrenIds: string[] = rows.map((child: IProduct) => child.id)

    const childIdsToAdd = foundChildrenIds.filter((childId) => !originalChildrenIds.includes(childId))
    const childIdsToRemove = originalChildrenIds.filter((childId) => !foundChildrenIds.includes(childId))

    const [addedChildrenTotal, addedChildren] = await productService.updateChildren(childIdsToAdd, productId)
    const [removedChildrenTotal, removedChildren] = await productService.updateChildren(childIdsToRemove, null)

    io.emit(`${String(productService.recordName())}`, { message: `${String(productService.recordName())} updated` })

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      [productService.singleRecord()]: {
        added: { addedChildrenTotal, addedChildren },
        removed: { removedChildrenTotal, removedChildren }
      }
    })
  }

  async addGraduatedPrice (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { record: product, body: { productGraduatedPrice } } = req

    const { response, status } = await productGraduatedPriceService.insert({ product, productGraduatedPrice })

    io.emit(`${String(productGraduatedPriceService.recordName())}`, { message: `${String(productGraduatedPriceService.recordName())} created` })

    const statusCode: StatusCode = {
      200: statusCodes.OK,
      201: statusCodes.CREATED
    }

    return res.status(statusCode[status]).send({
      statusCode: statusCode[status],
      success: true,
      [productGraduatedPriceService.singleRecord()]: response
    })
  }

  async getSimilarProducts (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      query: { limit, page, offset },
      params: { id },
      record: product
    } = req

    const { productTags }: { productTags: IProductTag[] } = product
    const productCategoryTags = productTags.map(tag => tag.productCategoryTag.id)

    const response = await productTagService.getSimilarProducts(limit, offset, productCategoryTags, id)
    const meta = {
      total: response.count,
      pageCount: Math.ceil(response.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [productTagService.manyRecords()]: response.rows
    })
  }

  async getProductVariations (req: CustomRequest, res: CustomResponse): Promise<any> {
    const {
      query: { limit, page, offset },
      params: { id },
      record: product
    } = req

    const parentId = product.isParent === true ? id : product.parentId

    const response = await productService.getProductVariations(limit, offset, parentId)
    const meta = {
      total: response.count,
      pageCount: Math.ceil(response.count / limit),
      perPage: limit,
      page
    }

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      [productService.manyRecords()]: response.rows
    })
  }
}

export default new ProductController(productService)
