import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductController from '../controllers/ProductController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const ProductRoutes = (): any => {
  const productRouter = express.Router()

  productRouter.use('/products', checkAuth, checkUserIsVerifiedStatus)
  productRouter.route('/products')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductAdmin
    }), asyncHandler(ProductController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateUsersQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductController.getAll))
  productRouter.use('/products/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductController.checkRecord))
  productRouter.route('/products/:id')
    .get(asyncHandler(ProductController.checkOwnerOrAdminOrCompanyAdministratorOrCampaignManager), asyncHandler(ProductController.get))
    .put(asyncHandler(ProductController.checkOwnerOrAdminOrCompanyAdministratorOrCampaignManager), celebrate({
      [Segments.BODY]: validator.validateProduct
    }), asyncHandler(ProductController.update))
    .delete(asyncHandler(ProductController.checkOwnerOrAdminOrCompanyAdministratorOrCampaignManager), asyncHandler(ProductController.delete))
  return productRouter
}

export default ProductRoutes
