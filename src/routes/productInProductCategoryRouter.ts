import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import ProductInProductCategoryController from '../controllers/ProductInProductCategoryController'

const productInProductCategoryRoutes = (): Router => {
  const productInProductCategoryRouter = express.Router()

  productInProductCategoryRouter.use('/product-product-categories', checkAuth, checkUserIsVerifiedStatus, ProductInProductCategoryController.setModule)
  productInProductCategoryRouter.use('/product-product-categories/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductInProductCategoryController.checkRecord))
  productInProductCategoryRouter.route('/product-product-categories/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductInProductCategoryController.purge))
  return productInProductCategoryRouter
}

export default productInProductCategoryRoutes
