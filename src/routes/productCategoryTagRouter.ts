import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCategoryTagController from '../controllers/ProductCategoryTagController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productCategoryTagRoutes = (): Router => {
  const productCategoryTagRouter = express.Router()

  productCategoryTagRouter.use('/product-category-tags', checkAuth, checkUserIsVerifiedStatus, ProductCategoryTagController.setModule)
  productCategoryTagRouter.route('/product-category-tags')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductCategoryTagController.getAll))
  productCategoryTagRouter.use('/product-category-tags/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCategoryTagController.checkRecord))
  productCategoryTagRouter.route('/product-category-tags/:id')
    .get(asyncHandler(ProductCategoryTagController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategoryTag
    }), asyncHandler(ProductCategoryTagController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductCategoryTagController.delete))
  return productCategoryTagRouter
}

export default productCategoryTagRoutes
