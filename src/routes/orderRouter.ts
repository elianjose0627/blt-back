import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import OrderController from '../controllers/OrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'

const orderRoutes = (): Router => {
  const orderRouter = express.Router()

  orderRouter.use('/orders', checkAuth, checkUserIsVerifiedStatus, OrderController.setModule)
  orderRouter.route('/orders')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(OrderController.getAll))
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateOrder
    }), asyncHandler(OrderController.insert))
  orderRouter.use('/orders/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(OrderController.checkRecord))
  orderRouter.route('/orders/:id')
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateOrderUpdate
    }), asyncHandler(OrderController.update))

  return orderRouter
}

export default orderRoutes
