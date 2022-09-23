import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import RecipientController from '../controllers/RecipientController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'

const RecipientRoutes = (): any => {
  const recipientRouter = express.Router()

  recipientRouter.use('/recipients', checkAuth)
  recipientRouter.use('/recipients/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(RecipientController.checkRecord))
  recipientRouter.route('/recipients/:id')
    .get(asyncHandler(RecipientController.checkOwner), asyncHandler(RecipientController.get))
    .put(asyncHandler(RecipientController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUpdatedRecipient
    }), asyncHandler(RecipientController.update))
    .delete(asyncHandler(RecipientController.checkOwner), asyncHandler(RecipientController.delete))
  return recipientRouter
}

export default RecipientRoutes
