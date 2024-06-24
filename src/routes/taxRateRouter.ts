import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import TaxRateController from '../controllers/TaxRateController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const taxRateRoutes = (): Router => {
  const taxRateRouter = express.Router()

  taxRateRouter.use('/tax-rates', checkAuth, TaxRateController.setModule)
  taxRateRouter.route('/tax-rates')
    .post(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateTaxRate
    }, { abortEarly: false }), asyncHandler(TaxRateController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(TaxRateController.getAll))
  taxRateRouter.use('/tax-rates/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(TaxRateController.checkRecord))
  taxRateRouter.route('/tax-rates/:id')
    .get(asyncHandler(TaxRateController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateTaxRateUpdate
    }), asyncHandler(TaxRateController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(TaxRateController.delete))
  return taxRateRouter
}

export default taxRateRoutes
