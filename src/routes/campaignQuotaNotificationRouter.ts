import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignQuotaNotificationController from '../controllers/CampaignQuotaNotificationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const campaignQuotaNotificationRoutes = (): Router => {
  const campaignQuotaNotificationRouter = express.Router()

  campaignQuotaNotificationRouter.use('/campaign-quota-notifications', checkAuth, checkUserIsVerifiedStatus, CampaignQuotaNotificationController.setModule)
  campaignQuotaNotificationRouter.use('/campaign-quota-notifications/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignQuotaNotificationController.checkRecord))
  campaignQuotaNotificationRouter.route('/campaign-quota-notifications/:id')
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCampaignQuotaNotification
    }), asyncHandler(CampaignQuotaNotificationController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CampaignQuotaNotificationController.delete))
  return campaignQuotaNotificationRouter
}

export default campaignQuotaNotificationRoutes
