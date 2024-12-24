import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import OrderConfirmationController from '../controllers/OrderConfirmationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const orderConfirmationRoutes = (): Router => {
  const orderConfirmationRouter = express.Router()

  orderConfirmationRouter.use('/order-confirmations', checkAuth, checkUserIsVerifiedStatus, OrderConfirmationController.setModule)
  orderConfirmationRouter.route('/order-confirmations')
    .get(celebrate({
      [Segments.QUERY]: validator.validateDocumentQueryParams
    }), asyncHandler(paginate), asyncHandler(OrderConfirmationController.getAll))
  orderConfirmationRouter.use('/order-confirmations/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(OrderConfirmationController.checkRecord))
  orderConfirmationRouter.route('/order-confirmations/:id')
    .get(asyncHandler(OrderConfirmationController.checkOwnerOrCompanyOrAdmin), asyncHandler(OrderConfirmationController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(OrderConfirmationController.delete))
  return orderConfirmationRouter
}

export default orderConfirmationRoutes
