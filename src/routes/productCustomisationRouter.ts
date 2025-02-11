import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCustomisationController from '../controllers/ProductCustomisationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productCustomisationRoutes = (): Router => {
  const productCustomisationRouter = express.Router()

  productCustomisationRouter.use(
    '/product-customisations',
    checkAuth,
    checkUserIsVerifiedStatus,
    ProductCustomisationController.setModule
  )
  productCustomisationRouter.use(
    '/product-customisations/:productCustomisationId',
    celebrate(
      {
        [Segments.PARAMS]: validator.validateProductCustomisationUUID
      },
      { abortEarly: false }
    ),
    asyncHandler(ProductCustomisationController.checkRecord),
    asyncHandler(ProductCustomisationController.checkOwnerOrAdmin)
  )
  productCustomisationRouter
    .route('/product-customisations/:productCustomisationId')
    .get(asyncHandler(ProductCustomisationController.get))
    .put(asyncHandler(ProductCustomisationController.update))
    .delete(asyncHandler(ProductCustomisationController.delete))

  productCustomisationRouter.route('/product-customisations/:productCustomisationId/chat')
    .get(asyncHandler(ProductCustomisationController.getAllChat))
    .post(celebrate({
      [Segments.BODY]: validator.validateProductCustomisationChat
    }), asyncHandler(ProductCustomisationController.insertChat))
  return productCustomisationRouter
}

export default productCustomisationRoutes
