import { celebrate, Segments } from 'celebrate'
import express from 'express'
import ShippingMethodController from '../controllers/ShippingMethodController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import validator from '../validators/validators'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'

const shippingMethodRoutes = (): any => {
  const shippingMethodRouter = express.Router()

  shippingMethodRouter.use('/shipping-methods', checkAuth, ShippingMethodController.setModule)
  shippingMethodRouter.route('/shipping-methods')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateShippingMethod
    }, { abortEarly: false }), asyncHandler(ShippingMethodController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ShippingMethodController.getAll))
  shippingMethodRouter.use('/shipping-methods/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ShippingMethodController.checkRecord))
  shippingMethodRouter.route('/shipping-methods/:id')
    .get(asyncHandler(ShippingMethodController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateShippingMethod
    }), asyncHandler(ShippingMethodController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ShippingMethodController.delete))
  return shippingMethodRouter
}

export default shippingMethodRoutes
