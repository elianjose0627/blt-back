import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductColorController from '../controllers/ProductColorController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productColorRoutes = (): Router => {
  const productColorRouter = express.Router()

  productColorRouter.use('/product-colors', checkAuth, checkUserIsVerifiedStatus, ProductColorController.setModule)
  productColorRouter.route('/product-colors')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductColor
    }), asyncHandler(ProductColorController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductColorController.getAll))
  productColorRouter.use('/product-colors/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductColorController.checkRecord))
  productColorRouter.route('/product-colors/:id')
    .get(asyncHandler(ProductColorController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductColor
    }), asyncHandler(ProductColorController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductColorController.delete))
  return productColorRouter
}

export default productColorRoutes
