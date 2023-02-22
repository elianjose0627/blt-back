import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import RecipientController from '../controllers/RecipientController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const RecipientRoutes = (): any => {
  const recipientRouter = express.Router()

  recipientRouter.use('/recipients', checkAuth, checkUserIsVerifiedStatus)
  recipientRouter.use('/recipients/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(RecipientController.checkRecord))
  recipientRouter.route('/recipients/:id')
    .get(asyncHandler(RecipientController.checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin), asyncHandler(RecipientController.get))
    .put(asyncHandler(RecipientController.checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateUpdatedRecipient
    }), asyncHandler(RecipientController.update))
    .delete(asyncHandler(RecipientController.checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin), asyncHandler(RecipientController.delete))
  return recipientRouter
}

export default RecipientRoutes
