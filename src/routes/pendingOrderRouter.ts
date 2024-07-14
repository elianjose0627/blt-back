import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PendingOrderController from '../controllers/PendingOrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'
import checkProductOrderQuantity from '../middlewares/checkProductOrderQuantity'

const pendingOrderRoutes = (): Router => {
  const pendingOrderRouter = express.Router()

  pendingOrderRouter.use('/pending-orders', checkAuth, checkUserIsVerifiedStatus)
  pendingOrderRouter.route('/pending-orders')
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(PendingOrderController.getAll))
    .post(PendingOrderController.setModule,
      celebrate({
        [Segments.BODY]: validator.validatePendingOrders
      }), asyncHandler(checkProductOrderQuantity), asyncHandler(PendingOrderController.insertCataloguePendingOrders))
  pendingOrderRouter.route('/pending-orders/duplicate')
    .post(celebrate({
      [Segments.BODY]: validator.validatePostedOrders
    }), asyncHandler(PendingOrderController.duplicate))

  return pendingOrderRouter
}

export default pendingOrderRoutes
