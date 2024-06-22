import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import SalesUnitController from '../controllers/SalesUnitController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const salesUnitRoutes = (): Router => {
  const salesUnitRouter = express.Router()

  salesUnitRouter.use('/sales-units', checkAuth, SalesUnitController.setModule)
  salesUnitRouter.route('/sales-units')
    .post(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateSalesUnit
    }, { abortEarly: false }), asyncHandler(SalesUnitController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(SalesUnitController.getAll))
  salesUnitRouter.use('/sales-units/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(SalesUnitController.checkRecord))
  salesUnitRouter.route('/sales-units/:id')
    .get(asyncHandler(SalesUnitController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateSalesUnitUpdate
    }), asyncHandler(SalesUnitController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(SalesUnitController.delete))
  return salesUnitRouter
}

export default salesUnitRoutes
