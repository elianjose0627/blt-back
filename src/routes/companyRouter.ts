import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CompanyController from '../controllers/CompanyController'
import CampaignController from '../controllers/CampaignController'
import UserController from '../controllers/UserController'
import AddressController from '../controllers/AddressController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import CostCenterController from '../controllers/CostCenterController'
import ProductController from '../controllers/ProductController'
import SecondaryDomainController from '../controllers/SecondaryDomainController'
import LegalTextController from '../controllers/LegalTextController'
import AccessPermissionController from '../controllers/AccessPermissionController'
import checkPermissions from '../middlewares/checkPermissions'
import checkBlockedDomain from '../middlewares/checkBlockedDomain'
import CompanySubscriptionController from '../controllers/CompanySubscriptionController'
import checkCompanySubscription from '../middlewares/checkCompanySubscription'

const companyRoutes = (): Router => {
  const companyRouter = express.Router()

  companyRouter.use('/companies', checkAuth, checkUserIsVerifiedStatus, CompanyController.setModule)
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
    .get(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions), asyncHandler(CompanyController.get))
    .put(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions), celebrate({
      [Segments.BODY]: validator.validateUpdatedCompany
    }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain), asyncHandler(CompanyController.update))
    .delete(asyncHandler(checkAdmin), asyncHandler(CompanyController.delete))
  companyRouter.route('/companies/:id/addresses')
    .post(AddressController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateCreatedAddress
      }, { abortEarly: false }), asyncHandler(CompanyController.createAddress))
    .get(AddressController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(AddressController.getAllForCompany))
  companyRouter.route('/companies/:id/campaigns')
    .post(CampaignController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification),
      CampaignController.checkValidation,
      asyncHandler(CampaignController.insert))
    .get(CampaignController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CampaignController.getAllForCompany))
  companyRouter.route('/companies/:id/cost-centers')
    .post(CostCenterController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateCostCenter
      }, { abortEarly: false }), asyncHandler(CostCenterController.insert))
    .get(CostCenterController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CostCenterController.getAllForCompany))
  companyRouter.route('/companies/:id/products')
    .post(ProductController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateProduct
      }, { abortEarly: false }), asyncHandler(ProductController.insert))
    .get(ProductController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateProductQueryParams
      }), asyncHandler(paginate), asyncHandler(ProductController.getAllForCompany))
  companyRouter.route('/companies/:id/secondary-domains')
    .post(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateSecondaryDomain
      }, { abortEarly: false }), asyncHandler(SecondaryDomainController.insert))
  companyRouter.route('/companies/:id/request-domain-verification')
    .get(asyncHandler(CompanyController.checkCompanyDomain), asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.getDomainVerificationCode))
  companyRouter.route('/companies/:id/verify-domain')
    .get(asyncHandler(CompanyController.checkCompanyDomain), asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.verifyDomain))
  companyRouter.route('/companies/:id/verify-domain')
    .patch(asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateDomain
    }, { abortEarly: false }),
    asyncHandler(CompanyController.update))
  companyRouter.route('/companies/:id/users')
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      celebrate({
        [Segments.BODY]: validator.validateJoinCompany
      }, { abortEarly: false }), asyncHandler(checkBlockedDomain), asyncHandler(UserController.addOrRemoveUserFromCompany))
    .get(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CompanyController.getAllUsers))
  companyRouter.use('/companies/:id/users/:userId', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CompanyController.checkCompanyDomainVerification))
  companyRouter.route('/companies/:id/users/:userId')
    .patch(celebrate({
      [Segments.BODY]: validator.validateUserCompanyRole
    }, { abortEarly: false }), asyncHandler(CompanyController.updateUserRole))
    .put(celebrate({
      [Segments.BODY]: validator.validateUpdatedUser
    }, { abortEarly: false }), asyncHandler(CompanyController.checkCompanyMembership), asyncHandler(CompanyController.updateCompanyEmployee))
  companyRouter.route('/companies/:id/users/:userId/address')
    .post(celebrate({
      [Segments.BODY]: validator.validateCreatedAddress
    }, { abortEarly: false }), asyncHandler(CompanyController.checkCompanyMembership), asyncHandler(CompanyController.createEmployeeAddress))
  companyRouter.route('/companies/:id/users/:userId/email-verification')
    .patch(celebrate({
      [Segments.BODY]: validator.validateEmailVerification
    }), asyncHandler(CompanyController.checkCompanyMembership), asyncHandler(CompanyController.updateEmailVerification))
  companyRouter.route('/companies/:id/legal-texts')
    .post(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateLegalText
      }, { abortEarly: false }), asyncHandler(LegalTextController.insert))
    .get(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(LegalTextController.getAllForCompany))
  companyRouter.route('/companies/:id/invite-link')
    .get(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), asyncHandler(CompanyController.getInviteLinkAndCode))
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateCompanyInviteToken
      }, { abortEarly: false }), asyncHandler(CompanyController.updateInviteLinkAndCode))
  companyRouter.route('/companies/:id/invite-domain-check')
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateCompanyInviteDomainCheck
      }, { abortEarly: false }), asyncHandler(CompanyController.updateInviteDomainCheck))
  companyRouter.route('/companies/:id/access-permissions')
    .post(AccessPermissionController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification),
      AccessPermissionController.checkAllowedModules,
      asyncHandler(AccessPermissionController.insert))
    .get(AccessPermissionController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(AccessPermissionController.getAllForCompany))
  companyRouter.route('/companies/:id/theme')
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(checkCompanySubscription),
      celebrate({
        [Segments.BODY]: validator.validateCompanyTheme
      }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain), asyncHandler(CompanyController.update))
  companyRouter.route('/companies/:id/logo')
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(checkCompanySubscription),
      celebrate({
        [Segments.BODY]: validator.validateCompanyLogo
      }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain), asyncHandler(CompanyController.update))
  companyRouter.route('/companies/:id/subscriptions')
    .post(CompanySubscriptionController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.BODY]: validator.validateCompanySubscription
      }, { abortEarly: false }), asyncHandler(CompanySubscriptionController.insert))
    .get(CompanySubscriptionController.setModule, asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      asyncHandler(CompanyController.checkCompanyDomainVerification), celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CompanySubscriptionController.getAllForCompany))
  companyRouter.route('/companies/:id/shop-header')
    .patch(asyncHandler(CompanyController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      celebrate({
        [Segments.BODY]: validator.validateCompanyShopHeader
      }), asyncHandler(CompanyController.checkCompanyDomainAndEmailDomain), asyncHandler(CompanyController.update))
  return companyRouter
}

export default companyRoutes
