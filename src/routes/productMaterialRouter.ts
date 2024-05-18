import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductMaterialController from '../controllers/ProductMaterialController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const productMaterialRoutes = (): Router => {
  const productMaterialRouter = express.Router()

  productMaterialRouter.use('/product-materials', checkAuth, checkUserIsVerifiedStatus, ProductMaterialController.setModule)
  productMaterialRouter.route('/product-materials')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductMaterial
    }), asyncHandler(ProductMaterialController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductMaterialController.getAll))
  productMaterialRouter.use('/product-materials/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductMaterialController.checkRecord))
  productMaterialRouter.route('/product-materials/:id')
    .get(asyncHandler(ProductMaterialController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductMaterial
    }), asyncHandler(ProductMaterialController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductMaterialController.delete))
  return productMaterialRouter
}

export default productMaterialRoutes
