import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import SalutationController from '../controllers/SalutationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const salutationRoutes = (): any => {
  const salutationRouter = express.Router()

  salutationRouter.use('/salutations', checkAuth, SalutationController.setModule)
  salutationRouter.route('/salutations')
    .post(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateSalutation
    }, { abortEarly: false }), asyncHandler(SalutationController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(SalutationController.getAll))
  salutationRouter.use('/salutations/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(SalutationController.checkRecord))
  salutationRouter.route('/salutations/:id')
    .get(asyncHandler(SalutationController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateSalutation
    }), asyncHandler(SalutationController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(SalutationController.delete))
  return salutationRouter
}

export default salutationRoutes
