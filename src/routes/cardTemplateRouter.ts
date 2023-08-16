import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CardTemplateController from '../controllers/CardTemplateController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'
import CampaignController from '../controllers/CampaignController'

const cardTemplateRoutes = (): any => {
  const cardTemplateRouter = express.Router()

  cardTemplateRouter.use('/card-templates', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  cardTemplateRouter.use('/card-templates/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CardTemplateController.checkRecord))
  cardTemplateRouter.route('/card-templates/:id')
    .get(asyncHandler(CardTemplateController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CardTemplateController.get))
    .delete(asyncHandler(CardTemplateController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CardTemplateController.delete))
  return cardTemplateRouter
}

export default cardTemplateRoutes
