import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PrivacyRuleController from '../controllers/PrivacyRuleController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const privacyRuleRoutes = (): any => {
  const privacyRuleRouter = express.Router()

  privacyRuleRouter.use('/privacy-rules', checkAuth, checkUserIsVerifiedStatus, PrivacyRuleController.setModule)
  privacyRuleRouter.route('/privacy-rules')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(checkAdmin), asyncHandler(paginate), asyncHandler(PrivacyRuleController.getAll))
  privacyRuleRouter.use('/privacy-rules/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(PrivacyRuleController.checkRecord))
  privacyRuleRouter.route('/privacy-rules/:id')
    .get(asyncHandler(checkAdmin), asyncHandler(PrivacyRuleController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validatePrivacyRule
    }), asyncHandler(PrivacyRuleController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(PrivacyRuleController.delete))
  return privacyRuleRouter
}

export default privacyRuleRoutes
