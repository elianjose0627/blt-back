import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductCategoryController from '../controllers/ProductCategoryController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import ProductCategoryTagController from '../controllers/ProductCategoryTagController'
import ProductInProductCategoryController from '../controllers/ProductInProductCategoryController'
import checkPermissions from '../middlewares/checkPermissions'

const productCategoryRoutes = (): Router => {
  const productCategoryRouter = express.Router()

  productCategoryRouter.use('/product-categories', checkAuth, checkUserIsVerifiedStatus, ProductCategoryController.setModule)
  productCategoryRouter.route('/product-categories')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategory
    }), asyncHandler(ProductCategoryController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductCategoryController.getAll))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategorySortOrder
    }), asyncHandler(ProductCategoryController.updateSortOrder))
  productCategoryRouter.use('/product-categories/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductCategoryController.checkRecord))
  productCategoryRouter.route('/product-categories/:id')
    .get(asyncHandler(ProductCategoryController.get))
    .put(asyncHandler(ProductCategoryController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.BODY]: validator.validateProductCategory
      }), asyncHandler(ProductCategoryController.update))
    .delete(asyncHandler(ProductCategoryController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), asyncHandler(ProductCategoryController.delete))
  productCategoryRouter.route('/product-categories/:id/tags')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategoryTag
    }), asyncHandler(ProductCategoryTagController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate),
    asyncHandler(ProductCategoryTagController.getAllTagsOfProductCategory))
  productCategoryRouter.route('/product-categories/:id/products')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategoryProducts
    }), asyncHandler(ProductInProductCategoryController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate),
    asyncHandler(ProductInProductCategoryController.getAllProductsInProductCategory))
  return productCategoryRouter
}

export default productCategoryRoutes
