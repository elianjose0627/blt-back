import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import SalutationController from '../controllers/SalutationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'

const salutationRoutes = (): any => {
  const salutationRouter = express.Router()

  salutationRouter.use('/salutations', checkAuth)
  salutationRouter.route('/salutations')
    .post(celebrate({
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
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateSalutation
    }), asyncHandler(SalutationController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(SalutationController.delete))
  return salutationRouter
}

export default salutationRoutes
