import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PendingOrderController from '../controllers/PendingOrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'
import checkProductOrderQuantity from '../middlewares/checkProductOrderQuantity'
import { uploadToMemory } from '../middlewares/uploadFile'
import uploadFileToGCP from '../middlewares/uploadFileToGCP'

const pendingOrderRoutes = (): Router => {
  const pendingOrderRouter = express.Router()

  pendingOrderRouter.use('/pending-orders', checkAuth, checkUserIsVerifiedStatus, PendingOrderController.setModule)
  pendingOrderRouter.route('/pending-orders')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(PendingOrderController.getAll))
    .post(celebrate({
      [Segments.BODY]: validator.validatePendingOrders
    }), asyncHandler(checkProductOrderQuantity), asyncHandler(PendingOrderController.insertCataloguePendingOrders))
  pendingOrderRouter.route('/pending-orders/duplicate')
    .post(celebrate({
      [Segments.BODY]: validator.validatePostedOrders
    }), asyncHandler(PendingOrderController.duplicate))
  pendingOrderRouter.route('/pending-orders/upload')
    .post(asyncHandler(uploadToMemory), asyncHandler(uploadFileToGCP), asyncHandler(PendingOrderController.insertGETECPendingOrder))
  pendingOrderRouter.use('/pending-orders/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(PendingOrderController.checkRecord))
  pendingOrderRouter.route('/pending-orders/:id')
    .get(asyncHandler(PendingOrderController.checkPermission), asyncHandler(PendingOrderController.get))
    .put(asyncHandler(PendingOrderController.checkPermission), celebrate({
      [Segments.BODY]: validator.validatePendingOrders
    }), asyncHandler(PendingOrderController.checkIsPostedOrQueued), asyncHandler(PendingOrderController.update))
    .delete(asyncHandler(PendingOrderController.checkPermission), asyncHandler(PendingOrderController.checkIsPostedOrQueued), asyncHandler(PendingOrderController.delete))

  return pendingOrderRouter
}

export default pendingOrderRoutes
