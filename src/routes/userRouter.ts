import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkOtp from '../middlewares/checkOtp'
import checkBlockedDomain from '../middlewares/checkBlockedDomain'

const userRoutes = (): Router => {
  const userRouter = express.Router()

  userRouter.use('/users', checkAuth, UserController.setModule)
  userRouter.route('/users')
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(UserController.getAll))
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCreatedUserByAdmin
    }), asyncHandler(checkBlockedDomain), asyncHandler(UserController.insert))
  userRouter.use('/users/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(UserController.checkRecord))
  userRouter.route('/users/:id')
    .get(asyncHandler(UserController.checkOwner), asyncHandler(UserController.get))
    .put(asyncHandler(UserController.checkOwnerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateUpdatedUser
    }), asyncHandler(UserController.updateUserAndAddress))
    .delete(asyncHandler(checkAdmin), asyncHandler(UserController.delete))
  userRouter.route('/users/:id/purge')
    .delete(asyncHandler(UserController.checkOwner), asyncHandler(UserController.purge))
  userRouter.route('/users/:id/role')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateRole
    }), asyncHandler(UserController.updateRole))
  userRouter.route('/users/:id/email-verification')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateEmailVerification
    }), asyncHandler(UserController.updateEmailVerification))
  userRouter.route('/users/:id/activate')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateUserActivation
    }), asyncHandler(UserController.updateActiveState))
  userRouter.route('/users/:id/photo')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUserPhoto
    }), asyncHandler(UserController.update))
  userRouter.route('/users/:id/password')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validatePassword
    }), asyncHandler(UserController.updatePassword))
  userRouter.route('/users/:id/password-reset-admin')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validatePasswordResetAdmin
    }), asyncHandler(UserController.updatePasswordAdmin))
  userRouter.route('/users/:id/verify')
    .post(asyncHandler(UserController.checkOwner), asyncHandler(UserController.sendVerifyEmail))
  userRouter.route('/users/:id/verify')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateOtp
    }), asyncHandler(checkOtp), asyncHandler(UserController.verifyEmail))
  userRouter.route('/users/:id/notifications')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateNotifications
    }), asyncHandler(UserController.updateNotifications))
    // Start DEPRECATED: /users/:id/address
  userRouter.route('/users/:id/address')
    .post(asyncHandler(UserController.checkOwnerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(UserController.createAddress))
    // End DEPRECATED
  userRouter.route('/users/:id/addresses')
    .post(asyncHandler(UserController.checkOwnerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(UserController.createAddress))
    .get(asyncHandler(UserController.checkOwnerOrAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(UserController.getAddresses))
  userRouter.route('/users/:id/company')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateUserCompanyAndRole
    }, { abortEarly: false }), asyncHandler(UserController.updateUserCompanyAndRole))
  userRouter.route('/users/:id/company-invite')
    .patch(asyncHandler(UserController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateUserCompanyInvite
    }, { abortEarly: false }), asyncHandler(UserController.updateUserCompanyViaInviteCode))
  return userRouter
}

export default userRoutes
