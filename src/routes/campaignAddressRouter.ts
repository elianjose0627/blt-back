import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignAddressController from '../controllers/CampaignAddressController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CampaignController from '../controllers/CampaignController'
import checkPermissions from '../middlewares/checkPermissions'

const campaignAddressRoutes = (): Router => {
  const campaignAddressRouter = express.Router()

  campaignAddressRouter.use('/campaign-addresses', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignAddressRouter.use('/campaign-addresses/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignAddressController.checkRecord))
  campaignAddressRouter.route('/campaign-addresses/:id')
    .delete(asyncHandler(CampaignAddressController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CampaignAddressController.delete))
  return campaignAddressRouter
}

export default campaignAddressRoutes
