import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCustomisationController from '../controllers/ProductCustomisationController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'
import paginate from '../middlewares/pagination'

const productCustomisationRoutes = (): Router => {
  const productCustomisationRouter = express.Router()

  productCustomisationRouter.use('/product-customisations', checkAuth, checkUserIsVerifiedStatus, ProductCustomisationController.setModule)
  productCustomisationRouter.use('/product-customisations/:productCustomisationId',
    celebrate({ [Segments.PARAMS]: validator.validateUUID },
      { abortEarly: false }),
    asyncHandler(ProductCustomisationController.checkRecord),
    asyncHandler(ProductCustomisationController.checkOwnerOrAdminOrEmployee),
    asyncHandler(checkPermissions))
  productCustomisationRouter.route('/product-customisations/:productCustomisationId')
    .get(asyncHandler(ProductCustomisationController.get))
    .put(celebrate({
      [Segments.BODY]: validator.validateProductCustomisation
    }, { abortEarly: false }), asyncHandler(ProductCustomisationController.update))
    .delete(asyncHandler(ProductCustomisationController.delete))
  productCustomisationRouter.route('/product-customisations/:productCustomisationId/chats')
    .get(asyncHandler(paginate), asyncHandler(ProductCustomisationController.getAllProductCustomisationChats))
    .post(celebrate({
      [Segments.BODY]: validator.validateProductCustomisationChat
    }, { abortEarly: false }), asyncHandler(ProductCustomisationController.insertProductCustomisationChat))
  return productCustomisationRouter
}

export default productCustomisationRoutes
