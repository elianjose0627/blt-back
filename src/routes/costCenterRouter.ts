import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CostCenterController from '../controllers/CostCenterController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const costCenterRoutes = (): any => {
  const costCenterRouter = express.Router()

  costCenterRouter.use('/cost-centers', checkAuth, checkUserIsVerifiedStatus)
  costCenterRouter.use('/cost-centers/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CostCenterController.checkRecord))
  costCenterRouter.route('/cost-centers/:id')
    .get(asyncHandler(CostCenterController.get))
    .put(asyncHandler(CostCenterController.checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateCostCenter
    }), asyncHandler(CostCenterController.update))
    .delete(asyncHandler(CostCenterController.checkOwnerOrCompanyAdministratorOrCampaignManagerOrAdmin), asyncHandler(CostCenterController.delete))
  return costCenterRouter
}

export default costCenterRoutes
