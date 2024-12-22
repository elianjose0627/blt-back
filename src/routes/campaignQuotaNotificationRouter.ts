import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignQuotaNotificationController from '../controllers/CampaignQuotaNotificationController'
import CampaignController from '../controllers/CampaignController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const campaignQuotaNotificationRoutes = (): Router => {
  const campaignQuotaNotificationRouter = express.Router()

  campaignQuotaNotificationRouter.use('/campaign-quota-notifications', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignQuotaNotificationRouter.use('/campaign-quota-notifications/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignQuotaNotificationController.checkRecord))
  campaignQuotaNotificationRouter.route('/campaign-quota-notifications/:id')
    .put(asyncHandler(checkPermissions), celebrate({
      [Segments.BODY]: validator.validateCampaignQuotaNotification
    }), asyncHandler(CampaignQuotaNotificationController.update))
    .delete(asyncHandler(checkPermissions), asyncHandler(CampaignQuotaNotificationController.delete))
  return campaignQuotaNotificationRouter
}

export default campaignQuotaNotificationRoutes
