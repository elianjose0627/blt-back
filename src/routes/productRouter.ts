import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductController from '../controllers/ProductController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const ProductRoutes = (): Router => {
  const productRouter = express.Router()

  productRouter.use('/products', checkAuth, checkUserIsVerifiedStatus, ProductController.setModule)
  productRouter.route('/products')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductAdmin
    }), asyncHandler(ProductController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductController.getAll))
  productRouter.use('/products/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductController.checkRecord))
  productRouter.route('/products/:id')
    .get(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(ProductController.get))
    .put(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), celebrate({
        [Segments.BODY]: validator.validateProduct
      }), asyncHandler(ProductController.update))
    .delete(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(ProductController.delete))
  productRouter.route('/products/:id/stocks')
    .get(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(ProductController.getProductStock))
  productRouter.route('/products/:id/outbounds')
    .get(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductController.getProductOutbounds))
  productRouter.route('/products/:id/inbounds')
    .get(asyncHandler(ProductController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductController.getProductInbounds))
  productRouter.route('/products/:id/company')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCompany
    }, { abortEarly: false }), asyncHandler(ProductController.updateProductCompany))
  return productRouter
}

export default ProductRoutes
