import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignQuotaController from '../controllers/CampaignQuotaController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const campaignQuotaRoutes = (): Router => {
  const campaignQuotaRouter = express.Router()

  campaignQuotaRouter.use('/campaign-quotas', checkAuth, checkUserIsVerifiedStatus, CampaignQuotaController.setModule)
  campaignQuotaRouter.use('/campaign-quotas/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignQuotaController.checkRecord))
  campaignQuotaRouter.route('/campaign-quotas/:id')
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCampaignQuota
    }), asyncHandler(CampaignQuotaController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CampaignQuotaController.delete))
  return campaignQuotaRouter
}

export default campaignQuotaRoutes
