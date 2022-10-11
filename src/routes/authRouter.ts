import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkResetToken from '../middlewares/checkResetToken'

const authRoutes = (): any => {
  const authRouter = express.Router()

  authRouter.route('/signup')
    .post(celebrate({
      [Segments.BODY]: validator.validateCreatedUser
    }, { abortEarly: false }), asyncHandler(UserController.insert))

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

  return authRouter
}

export default authRoutes
