import express from 'express'
import { celebrate } from 'celebrate'
import validator from '../validators/validators'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkOwner from '../middlewares/checkOwner'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkOtp from '../middlewares/checkOtp'

const userRoutes = (): any => {
  const userRouter = express.Router()

  userRouter.use('/users', checkAuth)
  userRouter.route('/users')
    .get(asyncHandler(checkAdmin), celebrate({
      query: validator.validateUsersQueryParams
    }), asyncHandler(paginate), asyncHandler(UserController.getAll))
  userRouter.use('/users/:id', celebrate({
    params: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserController.checkRecord))
  userRouter.route('/users/:id')
    .get(asyncHandler(checkOwner), asyncHandler(UserController.get))
    .put(asyncHandler(checkOwner), celebrate({
      body: validator.validateUpdatedUser
    }), asyncHandler(UserController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(UserController.delete))
  userRouter.route('/users/:id/purge')
    .delete(asyncHandler(checkOwner), asyncHandler(UserController.purge))
  userRouter.route('/users/:id/role')
    .patch(asyncHandler(checkAdmin), celebrate({
      body: validator.validateRole
    }), asyncHandler(UserController.updateRole))
  userRouter.route('/users/:id/photo')
    .patch(asyncHandler(checkOwner), celebrate({
      body: validator.validateUserPhoto
    }), asyncHandler(UserController.update))
  userRouter.route('/users/:id/password')
    .patch(asyncHandler(checkOwner), celebrate({
      body: validator.validatePassword
    }), asyncHandler(UserController.updatePassword))
  userRouter.route('/users/:id/verify')
    .post(asyncHandler(checkOwner), asyncHandler(UserController.sendVerifyEmail))
  userRouter.route('/users/:id/verify')
    .patch(asyncHandler(checkOwner), celebrate({
      body: validator.validateOtp
    }), asyncHandler(checkOtp), asyncHandler(UserController.verifyEmail))
  userRouter.route('/users/:id/notifications')
    .patch(asyncHandler(checkOwner), celebrate({
      body: validator.validateNotifications
    }), asyncHandler(UserController.updateNotifications))

  return userRouter
}

export default userRoutes
