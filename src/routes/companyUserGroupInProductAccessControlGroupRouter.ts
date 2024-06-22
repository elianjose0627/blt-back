import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CompanyUserGroupInProductAccessControlGroupController from '../controllers/CompanyUserGroupInProductAccessControlGroupController'

const companyUserGroupInProductAccessControlGroupRoutes = (): Router => {
  const companyUserGroupInProductAccessControlGroupRouter = express.Router()

  companyUserGroupInProductAccessControlGroupRouter.use('/company-user-groups-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, CompanyUserGroupInProductAccessControlGroupController.setModule)
  companyUserGroupInProductAccessControlGroupRouter.use('/company-user-groups-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyUserGroupInProductAccessControlGroupController.checkRecord))
  companyUserGroupInProductAccessControlGroupRouter.route('/company-user-groups-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyUserGroupInProductAccessControlGroupController.purge))
  return companyUserGroupInProductAccessControlGroupRouter
}

export default companyUserGroupInProductAccessControlGroupRoutes
