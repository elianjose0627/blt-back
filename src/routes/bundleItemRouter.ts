import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import BundleItemController from '../controllers/BundleItemController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const bundleItemRoutes = (): any => {
  const bundleItemRouter = express.Router()

  bundleItemRouter.use('/bundle-items', checkAuth, checkUserIsVerifiedStatus)
  bundleItemRouter.use('/bundle-items/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(BundleItemController.checkRecord))
  bundleItemRouter.route('/bundle-items/:id')
    .get(asyncHandler(BundleItemController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(BundleItemController.purge))
  return bundleItemRouter
}

export default bundleItemRoutes
