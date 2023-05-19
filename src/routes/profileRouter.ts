import express, { Router } from 'express'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'

const profileRoutes = (): Router => {
  const profileRouter = express.Router()

  profileRouter.use('/profiles', checkAuth, UserController.setModule)
  profileRouter.route('/profiles/me')
    .get(asyncHandler(UserController.getMyProfile))
  profileRouter.route('/profiles/:id')
    .get(asyncHandler(UserController.getProfileById))
  return profileRouter
}

export default profileRoutes
