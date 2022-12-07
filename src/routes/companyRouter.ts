import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CompanyController from '../controllers/CompanyController'
import CampaignController from '../controllers/CampaignController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import UserController from '../controllers/UserController'

const companyRoutes = (): any => {
  const companyRouter = express.Router()

  companyRouter.use('/companies', checkAuth)
  companyRouter.route('/companies')
    .post(celebrate({
      [Segments.BODY]: validator.validateCreatedCompany
    }, { abortEarly: false }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain),
    asyncHandler(CompanyController.insert))
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyController.getAll))
  companyRouter.use('/companies/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyController.checkRecord))
  companyRouter.route('/companies/:id')
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin), asyncHandler(CompanyController.get))
    .put(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin), celebrate({
      [Segments.BODY]: validator.validateUpdatedCompany
    }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain), asyncHandler(CompanyController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyController.delete))
  companyRouter.route('/companies/:id/address')
    .post(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin), celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(CompanyController.createAddress))
  companyRouter.route('/companies/:id/campaigns')
    .post(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrCampaignManager), celebrate({
      [Segments.BODY]: validator.validateCampaign
    }, { abortEarly: false }), asyncHandler(CampaignController.insert))
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrCampaignManager), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CampaignController.getAll))
  companyRouter.route('/companies/:id/request-domain-verification')
    .get(asyncHandler(CompanyController.checkCompanyDomain), asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin),
      asyncHandler(CompanyController.getDomainVerificationCode))
  companyRouter.route('/companies/:id/verify-domain')
    .get(asyncHandler(CompanyController.checkCompanyDomain), asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin),
      asyncHandler(CompanyController.verifyDomain))
  companyRouter.route('/companies/:id/users')
    .patch(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin), celebrate({
      [Segments.BODY]: validator.validateJoinCompany
    }, { abortEarly: false }), asyncHandler(UserController.updateCompanyId))
    .get(asyncHandler(CompanyController.checkOwnerOrCompanyAdministratorOrAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyController.getAllUsers))
  companyRouter.route('/companies/:id/users/:userId')
    .patch(celebrate({
      [Segments.PARAMS]: validator.validateUUID,
      [Segments.BODY]: validator.validateUserCompanyRole
    }, { abortEarly: false }), asyncHandler(CompanyController.updateUserRole))
  return companyRouter
}

export default companyRoutes
