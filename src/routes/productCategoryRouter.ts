import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCategoryController from '../controllers/ProductCategoryController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productCategoryRoutes = (): any => {
  const productCategoryRouter = express.Router()

  productCategoryRouter.use('/product-categories', checkAuth, checkUserIsVerifiedStatus, ProductCategoryController.setModule)
  productCategoryRouter.route('/product-categories')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategory
    }), asyncHandler(ProductCategoryController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductCategoryController.getAll))
  productCategoryRouter.use('/product-categories/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCategoryController.checkRecord))
  productCategoryRouter.route('/product-categories/:id')
    .get(asyncHandler(ProductCategoryController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategory
    }), asyncHandler(ProductCategoryController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductCategoryController.delete))
  return productCategoryRouter
}

export default productCategoryRoutes
