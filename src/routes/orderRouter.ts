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

  return orderRouter
}

export default orderRoutes
