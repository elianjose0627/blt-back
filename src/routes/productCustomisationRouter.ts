import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCustomisationController from '../controllers/ProductCustomisationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productCustomisationRoutes = (): Router => {
  const productCustomisationRouter = express.Router()

  productCustomisationRouter.use('/product-customisations', checkAuth, checkUserIsVerifiedStatus, ProductCustomisationController.setModule)
  productCustomisationRouter.route('/product-customisations')
    .post(celebrate({
      [Segments.BODY]: validator.validateProductCustomisation
    }), asyncHandler(ProductCustomisationController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateProductCustomisationQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductCustomisationController.getAll))
  productCustomisationRouter.use('/product-customisations/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCustomisationController.checkRecord))
  productCustomisationRouter.route('/product-customisations/:id')
    .get(asyncHandler(ProductCustomisationController.get))
    .put(asyncHandler(ProductCustomisationController.checkOwnerOrAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCustomisationForUpdate
    }), asyncHandler(ProductCustomisationController.update))
    .delete(asyncHandler(ProductCustomisationController.checkOwnerOrAdmin), asyncHandler(ProductCustomisationController.delete))
  productCustomisationRouter.route('/product-customisations/:id/chat')
    .get(asyncHandler(ProductCustomisationController.getAllChat))
    .post(celebrate({
      [Segments.BODY]: validator.validateProductCustomisationChat
    }), asyncHandler(ProductCustomisationController.insertChat))
  return productCustomisationRouter
}

export default productCustomisationRoutes
