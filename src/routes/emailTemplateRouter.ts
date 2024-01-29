import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import EmailTemplateController from '../controllers/EmailTemplateController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const emailTemplateRoutes = (): any => {
  const emailTemplateRouter = express.Router()

  emailTemplateRouter.use('/email-templates', checkAuth, checkUserIsVerifiedStatus, EmailTemplateController.setModule)
  emailTemplateRouter.route('/email-templates')
    .post(asyncHandler(checkAdmin), asyncHandler(EmailTemplateController.checkEmailTemplateType), celebrate({
      [Segments.BODY]: validator.validateEmailTemplate
    }, { abortEarly: false }), asyncHandler(EmailTemplateController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(EmailTemplateController.getAll))
  emailTemplateRouter.use('/email-templates/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(EmailTemplateController.checkRecord))
  emailTemplateRouter.route('/email-templates/:id')
    .get(asyncHandler(EmailTemplateController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(EmailTemplateController.checkEmailTemplateType), celebrate({
      [Segments.BODY]: validator.validateEmailTemplate
    }), asyncHandler(EmailTemplateController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(EmailTemplateController.delete))
  return emailTemplateRouter
}

export default emailTemplateRoutes
