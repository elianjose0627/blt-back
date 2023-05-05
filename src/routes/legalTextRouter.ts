import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import LegalTextController from '../controllers/LegalTextController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkAdmin from '../middlewares/checkAdmin'
import paginate from '../middlewares/pagination'

const legalTextRoutes = (): any => {
  const legalTextRouter = express.Router()

  legalTextRouter.route('/legal-texts')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(LegalTextController.getAll))
    .post(asyncHandler(checkAuth), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateLegalText
    }), asyncHandler(LegalTextController.insert))
  legalTextRouter.use('/legal-texts/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(checkAuth), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(LegalTextController.checkRecord))
  legalTextRouter.route('/legal-texts/:id')
    .get(asyncHandler(LegalTextController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateLegalText
    }), asyncHandler(LegalTextController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(LegalTextController.delete))
  return legalTextRouter
}

export default legalTextRoutes
