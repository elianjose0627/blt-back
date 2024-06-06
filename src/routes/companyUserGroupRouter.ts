import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CompanyUserGroupController from '../controllers/CompanyUserGroupController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import UserInCompanyUserGroupController from '../controllers/UserInCompanyUserGroupController'

const companyUserGroupRoutes = (): Router => {
  const companyUserGroupRouter = express.Router()

  companyUserGroupRouter.use('/company-user-groups', checkAuth, checkUserIsVerifiedStatus, CompanyUserGroupController.setModule)
  companyUserGroupRouter.route('/company-user-groups')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCompanyUserGroup
    }), asyncHandler(CompanyUserGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyUserGroupController.getAll))
  companyUserGroupRouter.use('/company-user-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyUserGroupController.checkRecord))
  companyUserGroupRouter.route('/company-user-groups/:id')
    .get(asyncHandler(CompanyUserGroupController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateUpdatedCompanyUserGroup
    }), asyncHandler(CompanyUserGroupController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyUserGroupController.delete))
  companyUserGroupRouter.route('/company-user-groups/:id/users')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateUserCompanyUserGroup
    }), asyncHandler(UserInCompanyUserGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(UserInCompanyUserGroupController.getAllUsersInCompanyUserGroup))
  return companyUserGroupRouter
}

export default companyUserGroupRoutes
