import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignController from '../controllers/CampaignController'
import RecipientController from '../controllers/RecipientController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'

const CampaignRoutes = (): any => {
  const campaignRouter = express.Router()

  campaignRouter.use('/campaigns', checkAuth)
  campaignRouter.use('/campaigns/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignController.checkRecord))
  campaignRouter.route('/campaigns/:id')
    .get(asyncHandler(CampaignController.checkOwner), asyncHandler(CampaignController.get))
    .put(asyncHandler(CampaignController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUpdatedRecipient
    }), asyncHandler(CampaignController.update))
    .delete(asyncHandler(CampaignController.checkOwner), asyncHandler(CampaignController.delete))
  campaignRouter.route('/campaigns/:id/recipients')
    .post(asyncHandler(CampaignController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateCreatedRecipient
    }, { abortEarly: false }), asyncHandler(RecipientController.insert))
    .get(asyncHandler(CampaignController.checkOwner), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(RecipientController.getAll))
  return campaignRouter
}

export default CampaignRoutes
