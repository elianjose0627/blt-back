import express, { Router } from 'express'
import InboundController from '../../controllers/jtl/InboundController'
import asyncHandler from '../../middlewares/asyncHandler'
import checkAuth from '../../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../../middlewares/checkUserIsVerifiedStatus'

const inboundRoutes = (): Router => {
  const inboundRouter = express.Router()

  inboundRouter.use('/inbounds', checkAuth, checkUserIsVerifiedStatus, InboundController.setModule)
  inboundRouter.route('/inbounds/:id')
    .get(asyncHandler(InboundController.getInbound))
  inboundRouter.route('/inbounds/:id/shipping-notifications')
    .get(asyncHandler(InboundController.getShippingNotifications))
  return inboundRouter
}

export default inboundRoutes
