import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CompanyProductAccessControlGroupController from '../controllers/CompanyProductAccessControlGroupController'

const companyProductAccessControlGroupRoutes = (): Router => {
  const companyProductAccessControlGroupRouter = express.Router()

  companyProductAccessControlGroupRouter.use('/company-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, CompanyProductAccessControlGroupController.setModule)
  companyProductAccessControlGroupRouter.use('/company-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyProductAccessControlGroupController.checkRecord))
  companyProductAccessControlGroupRouter.route('/company-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyProductAccessControlGroupController.delete))
  return companyProductAccessControlGroupRouter
}

export default companyProductAccessControlGroupRoutes
