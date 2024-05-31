import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import UserInCompanyUserGroupController from '../controllers/UserInCompanyUserGroupController'

const userInCompanyUserGroupRoutes = (): Router => {
  const userInCompanyUserGroupRouter = express.Router()

  userInCompanyUserGroupRouter.use('/user-company-user-groups', checkAuth, checkUserIsVerifiedStatus, UserInCompanyUserGroupController.setModule)
  userInCompanyUserGroupRouter.use('/user-company-user-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserInCompanyUserGroupController.checkRecord))
  userInCompanyUserGroupRouter.route('/user-company-user-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(UserInCompanyUserGroupController.delete))
  return userInCompanyUserGroupRouter
}

export default userInCompanyUserGroupRoutes
