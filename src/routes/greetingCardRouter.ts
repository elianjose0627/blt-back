import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import GreetingCardController from '../controllers/GreetingCardController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const greetingCardRoutes = (): Router => {
  const greetingCardRouter = express.Router()

  greetingCardRouter.use('/greeting-cards', checkAuth, checkUserIsVerifiedStatus, GreetingCardController.setModule)
  greetingCardRouter.route('/greeting-cards')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateGreetingCard
    }, { abortEarly: false }), asyncHandler(GreetingCardController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(GreetingCardController.getAll))
  greetingCardRouter.use('/greeting-cards/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(GreetingCardController.checkRecord))
  greetingCardRouter.route('/greeting-cards/:id')
    .get(asyncHandler(GreetingCardController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateGreetingCard
    }), asyncHandler(GreetingCardController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(GreetingCardController.delete))
  return greetingCardRouter
}

export default greetingCardRoutes
