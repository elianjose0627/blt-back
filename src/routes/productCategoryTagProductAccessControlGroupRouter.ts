import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import ProductCategoryTagProductAccessControlGroupController from '../controllers/ProductCategoryTagProductAccessControlGroupController'

const productCategoryTagProductAccessControlGroupRoutes = (): Router => {
  const productCategoryTagProductAccessControlGroupRouter = express.Router()

  productCategoryTagProductAccessControlGroupRouter.use('/product-category-tag-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, ProductCategoryTagProductAccessControlGroupController.setModule)
  productCategoryTagProductAccessControlGroupRouter.use('/product-category-tag-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCategoryTagProductAccessControlGroupController.checkRecord))
  productCategoryTagProductAccessControlGroupRouter.route('/product-category-tag-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductCategoryTagProductAccessControlGroupController.delete))
  return productCategoryTagProductAccessControlGroupRouter
}

export default productCategoryTagProductAccessControlGroupRoutes
