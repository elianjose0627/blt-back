import { celebrate, Segments } from 'celebrate'
import express from 'express'
import ShipmentController from '../controllers/ShipmentController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import validator from '../validators/validators'

const shipmentRoutes = (): any => {
  const shipmentRouter = express.Router()

  shipmentRouter.use('/shipments', checkAuth)
  shipmentRouter.use('/shipments/:trackingId', celebrate({
    [Segments.PARAMS]: validator.validateTrackingId
  }, { abortEarly: false }))
  shipmentRouter.route('/shipments/:trackingId')
    .get(asyncHandler(ShipmentController.get))
  return shipmentRouter
}

export default shipmentRoutes
