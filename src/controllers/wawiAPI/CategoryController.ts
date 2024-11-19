import BaseController from '../BaseController'
import CategoryService from '../../services/wawiAPI/CategoryService'
import * as statusCodes from '../../constants/statusCodes'
import type { CustomRequest, CustomResponse } from '../../types'

const categoryService = new CategoryService('Category')

class CategoryController extends BaseController {
  async getCategories (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { query: { page, limit } } = req
    const { TotalItems, PageNumber, PageSize, Items, TotalPages } = await categoryService.getCategories(page, limit)
    const meta = {
      total: TotalItems,
      pageCount: TotalPages,
      perPage: PageSize,
      page: PageNumber
    }
    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      meta,
      categories: Items
    })
  }
}

export default new CategoryController(categoryService)
