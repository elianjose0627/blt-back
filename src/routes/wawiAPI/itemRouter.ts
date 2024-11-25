import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import ItemController from '../../controllers/wawiAPI/ItemController'
import asyncHandler from '../../middlewares/asyncHandler'
import checkAuth from '../../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../../middlewares/checkUserIsVerifiedStatus'
import validator from '../../validators/validators'
import ProductController from '../../controllers/ProductController'

const itemRoutes = (): Router => {
  const itemRouter = express.Router()

  itemRouter.use('/items', checkAuth, checkUserIsVerifiedStatus, ProductController.setModule)
  itemRouter.route('/items')
    .post(celebrate({
      [Segments.BODY]: validator.validateArticleItem
    }, { abortEarly: false }), asyncHandler(ItemController.createItem))
  itemRouter.route('/items/:id')
    .get(asyncHandler(ItemController.getItem))
  return itemRouter
}

export default itemRoutes
