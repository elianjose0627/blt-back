import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import RecipientController from '../controllers/RecipientController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const RecipientRoutes = (): Router => {
  const recipientRouter = express.Router()

  recipientRouter.use('/recipients', checkAuth, checkUserIsVerifiedStatus, RecipientController.setModule)
  recipientRouter.use('/recipients/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(RecipientController.checkRecord))
  recipientRouter.route('/recipients/:id')
    .get(asyncHandler(RecipientController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(RecipientController.get))
    .put(asyncHandler(RecipientController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(RecipientController.checkPrivacyRule), celebrate({
        [Segments.BODY]: validator.validateUpdatedRecipient
      }), asyncHandler(RecipientController.update))
    .delete(asyncHandler(RecipientController.checkOwnerOrAdmin),
      asyncHandler(checkPermissions), asyncHandler(RecipientController.delete))
  return recipientRouter
}

export default RecipientRoutes
