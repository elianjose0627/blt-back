import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PictureController from '../controllers/PictureController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const pictureRoutes = (): any => {
  const pictureRouter = express.Router()

  pictureRouter.use('/pictures', checkAuth, checkUserIsVerifiedStatus, PictureController.setModule)
  pictureRouter.use('/pictures/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(PictureController.checkRecord))
  pictureRouter.route('/pictures/:id')
    .get(asyncHandler(PictureController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(PictureController.purge))
  return pictureRouter
}

export default pictureRoutes
