import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import UserInProductAccessControlGroupController from '../controllers/UserInProductAccessControlGroupController'

const userInProductAccessControlGroupRoutes = (): Router => {
  const userInProductAccessControlGroupRouter = express.Router()

  userInProductAccessControlGroupRouter.use('/user-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, UserInProductAccessControlGroupController.setModule)
  userInProductAccessControlGroupRouter.use('/user-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserInProductAccessControlGroupController.checkRecord))
  userInProductAccessControlGroupRouter.route('/user-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(UserInProductAccessControlGroupController.purge))
  return userInProductAccessControlGroupRouter
}

export default userInProductAccessControlGroupRoutes
