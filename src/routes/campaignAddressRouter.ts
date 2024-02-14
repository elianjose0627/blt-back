import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignAddressController from '../controllers/CampaignAddressController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CampaignController from '../controllers/CampaignController'

const campaignAddressRoutes = (): any => {
  const campaignAddressRouter = express.Router()

  campaignAddressRouter.use('/campaign-addresses', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignAddressRouter.use('/campaign-addresses/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignAddressController.checkRecord))
  campaignAddressRouter.route('/campaign-addresses/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(CampaignAddressController.delete))
  return campaignAddressRouter
}

export default campaignAddressRoutes
