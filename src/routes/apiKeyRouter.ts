import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ApiKeyController from '../controllers/ApiKeyController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'

const ApiKeyRoutes = (): Router => {
  const apiKeyRouter = express.Router()

  apiKeyRouter.use('/api-keys', checkAuth, checkUserIsVerifiedStatus, ApiKeyController.setModule)
  apiKeyRouter.route('/api-keys')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ApiKeyController.getAllForCurrentUser))
    .post(celebrate({
      [Segments.BODY]: validator.validateApiKey
    }, { abortEarly: false }), asyncHandler(ApiKeyController.insert))
  apiKeyRouter.use('/api-keys/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ApiKeyController.checkRecord))
  apiKeyRouter.route('/api-keys/:id')
    .get(asyncHandler(ApiKeyController.checkOwner)
      , asyncHandler(ApiKeyController.get))
    .put(asyncHandler(ApiKeyController.checkOwner), celebrate({
      [Segments.BODY]: validator.validateApiKey
    }, { abortEarly: false }), asyncHandler(ApiKeyController.update))
    .delete(asyncHandler(ApiKeyController.checkOwner), asyncHandler(ApiKeyController.delete))
  return apiKeyRouter
}

export default ApiKeyRoutes
