import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignShippingDestinationController from '../controllers/CampaignShippingDestinationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CampaignController from '../controllers/CampaignController'

const campaignShippingDestinationRoutes = (): any => {
  const campaignShippingDestinationRouter = express.Router()

  campaignShippingDestinationRouter.use('/campaign-shipping-destinations', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignShippingDestinationRouter.use('/campaign-shipping-destinations/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignShippingDestinationController.checkRecord))
  campaignShippingDestinationRouter.route('/campaign-shipping-destinations/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(CampaignShippingDestinationController.delete))
  return campaignShippingDestinationRouter
}

export default campaignShippingDestinationRoutes
