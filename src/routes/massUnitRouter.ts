import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import MassUnitController from '../controllers/MassUnitController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const massUnitRoutes = (): Router => {
  const massUnitRouter = express.Router()

  massUnitRouter.use('/mass-units', checkAuth, MassUnitController.setModule)
  massUnitRouter.route('/mass-units')
    .post(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateMassUnit
    }, { abortEarly: false }), asyncHandler(MassUnitController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(MassUnitController.getAll))
  massUnitRouter.use('/mass-units/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(MassUnitController.checkRecord))
  massUnitRouter.route('/mass-units/:id')
    .get(asyncHandler(MassUnitController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateMassUnitUpdate
    }), asyncHandler(MassUnitController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(MassUnitController.delete))
  return massUnitRouter
}

export default massUnitRoutes
