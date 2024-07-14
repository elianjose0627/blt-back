import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CostCenterController from '../controllers/CostCenterController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const costCenterRoutes = (): Router => {
  const costCenterRouter = express.Router()

  costCenterRouter.use('/cost-centers', checkAuth, checkUserIsVerifiedStatus, CostCenterController.setModule)
  costCenterRouter.use('/cost-centers/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CostCenterController.checkRecord))
  costCenterRouter.route('/cost-centers/:id')
    .get(asyncHandler(CostCenterController.get))
    .put(asyncHandler(CostCenterController.checkOwnerAdmin),
      asyncHandler(checkPermissions), celebrate({
        [Segments.BODY]: validator.validateCostCenter
      }), asyncHandler(CostCenterController.update))
    .delete(asyncHandler(CostCenterController.checkOwnerAdmin),
      asyncHandler(checkPermissions), asyncHandler(CostCenterController.delete))
  return costCenterRouter
}

export default costCenterRoutes
