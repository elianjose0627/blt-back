import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import ProductCategoryTagInProductAccessControlGroupController from '../controllers/ProductCategoryTagInProductAccessControlGroupController'

const productCategoryTagInProductAccessControlGroupRoutes = (): Router => {
  const productCategoryTagInProductAccessControlGroupRouter = express.Router()

  productCategoryTagInProductAccessControlGroupRouter.use('/product-category-tag-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, ProductCategoryTagInProductAccessControlGroupController.setModule)
  productCategoryTagInProductAccessControlGroupRouter.use('/product-category-tag-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCategoryTagInProductAccessControlGroupController.checkRecord))
  productCategoryTagInProductAccessControlGroupRouter.route('/product-category-tag-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductCategoryTagInProductAccessControlGroupController.purge))
  return productCategoryTagInProductAccessControlGroupRouter
}

export default productCategoryTagInProductAccessControlGroupRoutes
