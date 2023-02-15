import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import BundleController from '../controllers/BundleController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import PictureController from '../controllers/PictureController'

const bundleRoutes = (): any => {
  const bundleRouter = express.Router()

  bundleRouter.use('/bundles', checkAuth, checkUserIsVerifiedStatus)
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
  return bundleRouter
}

export default bundleRoutes
