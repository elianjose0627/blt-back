import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import BundleController from '../controllers/BundleController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import PictureController from '../controllers/PictureController'
import ProductController from '../controllers/ProductController'

const bundleRoutes = (): Router => {
  const bundleRouter = express.Router()

  bundleRouter.use('/bundles', checkAuth, checkUserIsVerifiedStatus, BundleController.setModule)
  bundleRouter.use('/bundles/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(BundleController.checkRecord))
  bundleRouter.route('/bundles/:id')
    .get(asyncHandler(BundleController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateBundle
    }), asyncHandler(BundleController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(BundleController.delete))
  bundleRouter.route('/bundles/:id/pictures')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validatePicture
    }), asyncHandler(PictureController.insert))
  bundleRouter.route('/bundles/:id/stocks')
    .get(asyncHandler(ProductController.getProductStock))
  return bundleRouter
}

export default bundleRoutes
