import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductController from '../controllers/ProductController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'
import ProductTagController from '../controllers/ProductTagController'
import setCatalogueAccess from '../middlewares/setCatalogueAccess'
import ProductCustomisationController from '../controllers/ProductCustomisationController'
import productStockNotificationController from '../controllers/ProductStockNotificationController'

const ProductRoutes = (): Router => {
  const productRouter = express.Router()

  productRouter.use('/products', checkAuth, checkUserIsVerifiedStatus, ProductController.setModule)
  productRouter.route('/products')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductAdmin
    }), asyncHandler(ProductController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateProductQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductController.getAll))
  productRouter.route('/products/catalogue')
    .get(celebrate({
      [Segments.QUERY]: validator.validateProductQueryParams
    }), asyncHandler(paginate),
    asyncHandler(setCatalogueAccess),
    asyncHandler(ProductController.getAll))
  productRouter.use('/products/:id/catalogue', celebrate({
    [Segments.PARAMS]: validator.validateProductId
  }, { abortEarly: false }), asyncHandler(setCatalogueAccess), asyncHandler(ProductController.checkRecord))
  productRouter.route('/products/:id/catalogue')
    .get(asyncHandler(ProductController.get))
  productRouter.route('/products/:id/catalogue/similar')
    .get(celebrate({
      [Segments.QUERY]: validator.validateProductQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductController.getSimilarProducts))
  productRouter.route('/products/:id/catalogue/variations')
    .get(celebrate({
      [Segments.QUERY]: validator.validateProductQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductController.getProductVariations))
  productRouter.use('/products/:id', celebrate({
    [Segments.PARAMS]: validator.validateProductId
  }, { abortEarly: false }), asyncHandler(ProductController.checkRecord))
  productRouter.route('/products/:id')
    .get(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), asyncHandler(ProductController.get))
    .put(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkAdmin), celebrate({
        [Segments.BODY]: validator.validateProductUpdate
      }), asyncHandler(ProductController.update))
    .delete(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkAdmin), asyncHandler(ProductController.delete))
  productRouter.route('/products/:id/stocks')
    .get(asyncHandler(ProductController.getProductStock))
  productRouter.route('/products/:id/outbounds')
    .get(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductController.getProductOutbounds))
  productRouter.route('/products/:id/inbounds')
    .get(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductController.getProductInbounds))
  productRouter.route('/products/:id/company')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCompany
    }, { abortEarly: false }), asyncHandler(ProductController.updateProductCompany))
  productRouter.route('/products/:id/tags')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductTag
    }, { abortEarly: false }), asyncHandler(ProductTagController.insert))
  productRouter.route('/products/:id/child')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateChild
    }, { abortEarly: false }), asyncHandler(ProductController.updateChild))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductController.removeChild))
  productRouter.route('/products/:id/children')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateChildren
    }, { abortEarly: false }), asyncHandler(ProductController.updateChildren))
  productRouter.route('/products/:id/graduated-prices')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateGraduatedPrice
    }, { abortEarly: false }), asyncHandler(ProductController.addGraduatedPrice))
  productRouter.route('/products/:id/children/graduated-prices')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateUUID
    }), asyncHandler(ProductController.addGraduatedPriceToChildren))
  productRouter.route('/products/:id/product-customisations')
    .post(ProductCustomisationController.setModule, asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.BODY]: validator.validateProductCustomisation
      }), asyncHandler(ProductCustomisationController.insert))
    .get(ProductCustomisationController.setModule, asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductCustomisationController.getAll))
  productRouter.route('/products/:id/stock-notifications')
    .post(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.BODY]: validator.validateProductStockNotification
      }), asyncHandler(productStockNotificationController.insert))
    .get(asyncHandler(ProductController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(productStockNotificationController.getAllProductStockNotifications))

  return productRouter
}

export default ProductRoutes
