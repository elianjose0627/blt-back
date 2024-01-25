import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignOrderLimitController from '../controllers/CampaignOrderLimitController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CampaignController from '../controllers/CampaignController'

const campaignOrderLimitRoutes = (): any => {
  const campaignOrderLimitRouter = express.Router()

  campaignOrderLimitRouter.use('/campaign-order-limits', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignOrderLimitRouter.use('/campaign-order-limits/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignOrderLimitController.checkRecord))
  campaignOrderLimitRouter.route('/campaign-order-limits/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(CampaignOrderLimitController.delete))
  return campaignOrderLimitRouter
}

export default campaignOrderLimitRoutes
