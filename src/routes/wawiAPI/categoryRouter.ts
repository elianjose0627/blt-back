import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import CategoryController from '../../controllers/wawiAPI/CategoryController'
import asyncHandler from '../../middlewares/asyncHandler'
import checkAuth from '../../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../../middlewares/checkUserIsVerifiedStatus'
import paginate from '../../middlewares/pagination'
import validator from '../../validators/validators'

const itemRoutes = (): Router => {
  const itemRouter = express.Router()

  itemRouter.use('/categories', checkAuth, checkUserIsVerifiedStatus, CategoryController.setModule)
  itemRouter.route('/categories')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CategoryController.getCategories))
  return itemRouter
}

export default itemRoutes
