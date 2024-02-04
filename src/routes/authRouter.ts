import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkResetToken from '../middlewares/checkResetToken'
import TokenController from '../controllers/TokenController'
import checkBlockedDomain from '../middlewares/checkBlockedDomain'

const authRoutes = (): any => {
  const authRouter = express.Router()

  authRouter.route('/signup')
    .post(celebrate({
      [Segments.BODY]: validator.validateCreatedUser,
      [Segments.QUERY]: validator.validateRegistrationQueryParams
    }, { abortEarly: false }), asyncHandler(checkBlockedDomain), asyncHandler(UserController.insert))

  authRouter.route('/login')
    .post(celebrate({
      [Segments.BODY]: validator.validateLogin
    }, { abortEarly: false }), asyncHandler(UserController.login))

  authRouter.route('/logout')
    .patch(asyncHandler(checkAuth), asyncHandler(UserController.logout))

  authRouter.route('/forgot-password')
    .post(celebrate({
      [Segments.BODY]: validator.validateEmail
    }), asyncHandler(UserController.forgotPassword))

  authRouter.route('/reset-password')
    .patch(celebrate({
      [Segments.BODY]: validator.validatePasswordReset
    }), asyncHandler(checkResetToken), asyncHandler(UserController.resetPassword))

  authRouter.route('/token')
    .post(asyncHandler(checkAuth), asyncHandler(TokenController.getAuthToken))

  authRouter.route('/token/refresh')
    .post(celebrate({
      [Segments.BODY]: validator.validateAuthToken
    }), asyncHandler(checkAuth), asyncHandler(TokenController.getRefreshToken))

  return authRouter
}

export default authRoutes
