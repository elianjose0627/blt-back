import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import EmailTemplateTypeController from '../controllers/EmailTemplateTypeController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const emailTemplateRoutes = (): Router => {
  const emailTemplateRouter = express.Router()

  emailTemplateRouter.use('/email-template-types', checkAuth, checkUserIsVerifiedStatus, EmailTemplateTypeController.setModule)
  emailTemplateRouter.route('/email-template-types')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateEmailTemplateType
    }, { abortEarly: false }), asyncHandler(EmailTemplateTypeController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(EmailTemplateTypeController.getAll))
  emailTemplateRouter.use('/email-template-types/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(EmailTemplateTypeController.checkRecord))
  emailTemplateRouter.route('/email-template-types/:id')
    .get(asyncHandler(EmailTemplateTypeController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateEmailTemplateType
    }), asyncHandler(EmailTemplateTypeController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(EmailTemplateTypeController.delete))
  return emailTemplateRouter
}

export default emailTemplateRoutes
