import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignAdditionalProductSettingController from '../controllers/CampaignAdditionalProductSettingController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CampaignController from '../controllers/CampaignController'
import checkPermissions from '../middlewares/checkPermissions'

const campaignAdditionalProductSettingRoutes = (): Router => {
  const campaignAdditionalProductSettingRouter = express.Router()

  campaignAdditionalProductSettingRouter.use('/campaign-additional-product-settings', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignAdditionalProductSettingRouter.use('/campaign-additional-product-settings/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignAdditionalProductSettingController.checkRecord))
  campaignAdditionalProductSettingRouter.route('/campaign-additional-product-settings/:id')
    .delete(asyncHandler(CampaignAdditionalProductSettingController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CampaignAdditionalProductSettingController.delete))
  return campaignAdditionalProductSettingRouter
}

export default campaignAdditionalProductSettingRoutes
