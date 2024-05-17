import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import UserProductAccessControlGroupController from '../controllers/UserProductAccessControlGroupController'

const userProductAccessControlGroupRoutes = (): Router => {
  const userProductAccessControlGroupRouter = express.Router()

  userProductAccessControlGroupRouter.use('/user-product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, UserProductAccessControlGroupController.setModule)
  userProductAccessControlGroupRouter.use('/user-product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserProductAccessControlGroupController.checkRecord))
  userProductAccessControlGroupRouter.route('/user-product-access-control-groups/:id')
    .delete(asyncHandler(checkAdmin), asyncHandler(UserProductAccessControlGroupController.delete))
  return userProductAccessControlGroupRouter
}

export default userProductAccessControlGroupRoutes
