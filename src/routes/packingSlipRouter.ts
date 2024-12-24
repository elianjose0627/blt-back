import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PackingSlipController from '../controllers/PackingSlipController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const packingSlipRoutes = (): Router => {
  const packingSlipRouter = express.Router()

  packingSlipRouter.use('/packing-slips', checkAuth, checkUserIsVerifiedStatus, PackingSlipController.setModule)
  packingSlipRouter.route('/packing-slips')
    .get(celebrate({
      [Segments.QUERY]: validator.validateDocumentQueryParams
    }), asyncHandler(paginate), asyncHandler(PackingSlipController.getAll))
  packingSlipRouter.use('/packing-slips/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(PackingSlipController.checkRecord))
  packingSlipRouter.route('/packing-slips/:id')
    .get(asyncHandler(PackingSlipController.checkOwnerOrCompanyOrAdmin), asyncHandler(PackingSlipController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(PackingSlipController.delete))
  return packingSlipRouter
}

export default packingSlipRoutes
