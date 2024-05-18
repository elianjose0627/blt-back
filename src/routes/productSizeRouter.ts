import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductSizeController from '../controllers/ProductSizeController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productSizeRoutes = (): Router => {
  const productSizeRouter = express.Router()

  productSizeRouter.use('/product-sizes', checkAuth, checkUserIsVerifiedStatus, ProductSizeController.setModule)
  productSizeRouter.route('/product-sizes')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductSize
    }), asyncHandler(ProductSizeController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductSizeController.getAll))
  productSizeRouter.use('/product-sizes/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductSizeController.checkRecord))
  productSizeRouter.route('/product-sizes/:id')
    .get(asyncHandler(ProductSizeController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductSize
    }), asyncHandler(ProductSizeController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductSizeController.delete))
  return productSizeRouter
}

export default productSizeRoutes
