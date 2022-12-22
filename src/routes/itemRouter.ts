import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import ItemController from '../controllers/ItemController'

const bundleRoutes = (): any => {
  const bundleRouter = express.Router()

  bundleRouter.use('/items', checkAuth)
  bundleRouter.route('/items')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ItemController.getAll))
  bundleRouter.use('/items/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ItemController.checkRecord))
  bundleRouter.route('/items/:id')
    .get(asyncHandler(ItemController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateBundleItem
    }), asyncHandler(ItemController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ItemController.delete))
  return bundleRouter
}

export default bundleRoutes
