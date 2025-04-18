import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import AccessPermissionController from '../controllers/AccessPermissionController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'

const accessPermissionRoutes = (): Router => {
  const accessPermissionRouter = express.Router()

  accessPermissionRouter.use('/access-permissions', checkAuth, checkUserIsVerifiedStatus, AccessPermissionController.setModule)
  accessPermissionRouter.route('/access-permissions')
    .post(asyncHandler(checkAdmin), AccessPermissionController.checkAllowedModulesAdmin, asyncHandler(AccessPermissionController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(AccessPermissionController.getAll))
  accessPermissionRouter.route('/access-permissions/default')
    .get(asyncHandler(checkPermissions),
      asyncHandler(AccessPermissionController.getDefaultPermissions))
  accessPermissionRouter.use('/access-permissions/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(AccessPermissionController.checkRecord))
  accessPermissionRouter.route('/access-permissions/:id')
    .get(asyncHandler(AccessPermissionController.checkOwnerOrAdmin), asyncHandler(checkPermissions),
      asyncHandler(AccessPermissionController.get))
    .put(asyncHandler(AccessPermissionController.checkOwnerOrAdmin), asyncHandler(checkPermissions),
      AccessPermissionController.checkAllowedModules, asyncHandler(AccessPermissionController.update))
    .delete(asyncHandler(AccessPermissionController.checkOwnerOrAdmin), asyncHandler(checkPermissions),
      asyncHandler(AccessPermissionController.delete))
  return accessPermissionRouter
}

export default accessPermissionRoutes
