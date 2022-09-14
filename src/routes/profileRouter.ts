import express from 'express'
import UserController from '../controllers/UserController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'

const profileRoutes = (): any => {
  const profileRouter = express.Router()

  profileRouter.use('/profiles', asyncHandler(checkAuth))
  profileRouter.route('/profiles/me')
    .get(asyncHandler(UserController.getMyProfile))
  profileRouter.route('/profiles/:id')
    .get(asyncHandler(UserController.getProfileById))
  return profileRouter
}

export default profileRoutes
