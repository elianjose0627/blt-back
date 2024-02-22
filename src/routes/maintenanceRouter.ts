import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import MaintenanceModeController from '../controllers/MaintenanceModeController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'

const maintenanceModeRoutes = (): any => {
  const maintenanceModeRouter = express.Router()

  maintenanceModeRouter.use('/maintenance-modes', checkAuth)
  maintenanceModeRouter.route('/maintenance-modes')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateMaintenanceMode
    }, { abortEarly: false }), asyncHandler(MaintenanceModeController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(MaintenanceModeController.getAll))
  maintenanceModeRouter.use('/maintenance-modes/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(MaintenanceModeController.checkRecord))
  maintenanceModeRouter.route('/maintenance-modes/:id')
    .get(asyncHandler(MaintenanceModeController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateMaintenanceMode
    }), asyncHandler(MaintenanceModeController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(MaintenanceModeController.delete))
  return maintenanceModeRouter
}

export default maintenanceModeRoutes
