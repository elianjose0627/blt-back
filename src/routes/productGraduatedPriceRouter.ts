import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductGraduatedPriceController from '../controllers/ProductGraduatedPriceController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productGraduatedPriceRoutes = (): Router => {
  const productGraduatedPriceRouter = express.Router()

  productGraduatedPriceRouter.use('/product-graduated-prices', checkAuth, checkUserIsVerifiedStatus, ProductGraduatedPriceController.setModule)
  productGraduatedPriceRouter.route('/product-graduated-prices')
  productGraduatedPriceRouter.use('/product-graduated-prices/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductGraduatedPriceController.checkRecord))
  productGraduatedPriceRouter.route('/product-graduated-prices/:id')
    .get(asyncHandler(checkAdmin), asyncHandler(ProductGraduatedPriceController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateGraduatedPrice
    }), asyncHandler(ProductGraduatedPriceController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductGraduatedPriceController.delete))
  return productGraduatedPriceRouter
}

export default productGraduatedPriceRoutes
