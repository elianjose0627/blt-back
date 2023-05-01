import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import SecondaryDomainController from '../controllers/SecondaryDomainController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const secondaryDomainRoutes = (): any => {
  const secondaryDomainRouter = express.Router()

  secondaryDomainRouter.use('/secondary-domains', checkAuth, checkUserIsVerifiedStatus)
  secondaryDomainRouter.use('/secondary-domains/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(SecondaryDomainController.checkRecord))
  secondaryDomainRouter.route('/secondary-domains/:id')
    .get(asyncHandler(SecondaryDomainController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateSecondaryDomain
    }), asyncHandler(SecondaryDomainController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(SecondaryDomainController.delete))
  return secondaryDomainRouter
}

export default secondaryDomainRoutes
