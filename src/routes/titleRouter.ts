import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import TitleController from '../controllers/TitleController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const titleRoutes = (): Router => {
  const titleRouter = express.Router()

  titleRouter.use('/titles', checkAuth, TitleController.setModule)
  titleRouter.route('/titles')
    .post(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateTitle
    }, { abortEarly: false }), asyncHandler(TitleController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(TitleController.getAll))
  titleRouter.use('/titles/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(TitleController.checkRecord))
  titleRouter.route('/titles/:id')
    .get(asyncHandler(TitleController.get))
    .put(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), celebrate({
      [Segments.BODY]: validator.validateTitle
    }), asyncHandler(TitleController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(checkUserIsVerifiedStatus), asyncHandler(TitleController.delete))
  return titleRouter
}

export default titleRoutes
