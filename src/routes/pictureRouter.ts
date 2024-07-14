import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PictureController from '../controllers/PictureController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'

const pictureRoutes = (): Router => {
  const pictureRouter = express.Router()

  pictureRouter.use('/pictures', checkAuth, checkUserIsVerifiedStatus, PictureController.setModule)
  pictureRouter.route('/pictures/cards')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(PictureController.getCardsFromFirebase))
  pictureRouter.use('/pictures/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(PictureController.checkRecord))
  pictureRouter.route('/pictures/:id')
    .get(asyncHandler(PictureController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(PictureController.purge))
  return pictureRouter
}

export default pictureRoutes
