import express, { Router } from 'express'
import OutboundController from '../../controllers/jtl/OutboundController'
import asyncHandler from '../../middlewares/asyncHandler'
import checkAuth from '../../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../../middlewares/checkUserIsVerifiedStatus'

const outboundRoutes = (): Router => {
  const outboundRouter = express.Router()

  outboundRouter.use('/outbounds', checkAuth, checkUserIsVerifiedStatus, OutboundController.setModule)
  outboundRouter.route('/outbounds/:id/shipping-notifications')
    .get(asyncHandler(OutboundController.getShippingNotifications))
  return outboundRouter
}

export default outboundRoutes
