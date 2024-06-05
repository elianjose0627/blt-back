import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import ProductAccessControlGroupController from '../controllers/ProductAccessControlGroupController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import ProductCategoryTagInProductAccessControlGroupController from '../controllers/ProductCategoryTagInProductAccessControlGroupController'
import UserInProductAccessControlGroupController from '../controllers/UserInProductAccessControlGroupController'
import CompanyInProductAccessControlGroupController from '../controllers/CompanyInProductAccessControlGroupController'
import CompanyUserGroupProductAccessGroupController from '../controllers/CompanyUserGroupInProductAccessControlGroupController'

const productAccessControlGroupRoutes = (): Router => {
  const productAccessControlGroupRouter = express.Router()

  productAccessControlGroupRouter.use('/product-access-control-groups', checkAuth, checkUserIsVerifiedStatus, ProductAccessControlGroupController.setModule)
  productAccessControlGroupRouter.route('/product-access-control-groups')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductAccessControlGroup
    }), asyncHandler(ProductAccessControlGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(ProductAccessControlGroupController.getAll))
  productAccessControlGroupRouter.use('/product-access-control-groups/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(ProductAccessControlGroupController.checkRecord))
  productAccessControlGroupRouter.route('/product-access-control-groups/:id')
    .get(asyncHandler(ProductAccessControlGroupController.get))
    .put(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductAccessControlGroup
    }), asyncHandler(ProductAccessControlGroupController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(ProductAccessControlGroupController.delete))
  productAccessControlGroupRouter.route('/product-access-control-groups/:id/product-category-tags')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateProductCategoryTagProductAccessControlGroup
    }), asyncHandler(ProductCategoryTagInProductAccessControlGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate),
    asyncHandler(ProductCategoryTagInProductAccessControlGroupController.getAllInProductAccessControlGroup))
  productAccessControlGroupRouter.route('/product-access-control-groups/:id/users')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateUserProductAccessControlGroup
    }), asyncHandler(UserInProductAccessControlGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate),
    asyncHandler(UserInProductAccessControlGroupController.getAllUsersInProductAccessControlGroup))
  productAccessControlGroupRouter.route('/product-access-control-groups/:id/companies')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCompanyProductAccessControlGroup
    }), asyncHandler(CompanyInProductAccessControlGroupController.insert))
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate),
    asyncHandler(CompanyInProductAccessControlGroupController.getAllCompaniesInProductAccessControlGroup))
  productAccessControlGroupRouter.route('/product-access-control-groups/:id/company-user-groups')
    .post(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateCompanyUserGroupProductAccessControlGroup
    }), asyncHandler(CompanyUserGroupProductAccessGroupController.insert))
  return productAccessControlGroupRouter
}

export default productAccessControlGroupRoutes
