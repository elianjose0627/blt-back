import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import CampaignController from '../controllers/CampaignController'
import RecipientController from '../controllers/RecipientController'
import BundleController from '../controllers/BundleController'
import PendingOrderController from '../controllers/PendingOrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import checkPermissions from '../middlewares/checkPermissions'
import CardTemplateController from '../controllers/CardTemplateController'
import CardSettingController from '../controllers/CardSettingController'
import CampaignOrderLimitController from '../controllers/CampaignOrderLimitController'
import CampaignShippingDestinationController from '../controllers/CampaignShippingDestinationController'

const CampaignRoutes = (): any => {
  const campaignRouter = express.Router()

  campaignRouter.use('/campaigns', checkAuth, checkUserIsVerifiedStatus, CampaignController.setModule)
  campaignRouter.route('/campaigns')
    .get(asyncHandler(checkAdmin), celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(CampaignController.getAll))
  campaignRouter.use('/campaigns/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(CampaignController.checkRecord), asyncHandler(CampaignController.checkIsHidden))
  campaignRouter.route('/campaigns/:id')
    .get(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions), asyncHandler(CampaignController.get))
    .put(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      CampaignController.checkValidation, asyncHandler(CampaignController.update))
    .delete(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(CampaignController.delete))
  campaignRouter.route('/campaigns/:id/recipients')
    .post(RecipientController.setModule, asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.BODY]: validator.validateCreatedRecipient
      }, { abortEarly: false }), asyncHandler(RecipientController.insert))
    .get(RecipientController.setModule, asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(RecipientController.getAll))
  campaignRouter.route('/campaigns/:id/bundles')
    .post(BundleController.setModule, asyncHandler(checkAdmin), celebrate({
      [Segments.BODY]: validator.validateBundle
    }, { abortEarly: false }), asyncHandler(BundleController.insert))
    .get(BundleController.setModule, asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(BundleController.getAll))
  campaignRouter.route('/campaigns/:id/orders')
    .get(BundleController.setModule, asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CampaignController.getAllCampaignOrders))
  campaignRouter.route('/campaigns/:id/orders/:jfsku')
    .get(BundleController.setModule, asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CampaignController.getAllCampaignOrders))
  campaignRouter.route('/campaigns/:id/pending-orders')
    .post(PendingOrderController.setModule,
      asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee), asyncHandler(checkPermissions),
      asyncHandler(CampaignController.checkIsNotActive),
      celebrate({
        [Segments.BODY]: validator.validatePendingOrder
      }), asyncHandler(PendingOrderController.insert))
  campaignRouter.route('/campaigns/:id/card-templates')
    .post(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.BODY]: validator.validateCardTemplate
      }), asyncHandler(CardTemplateController.insert))
    .get(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkPermissions),
      celebrate({
        [Segments.QUERY]: validator.validateQueryParams
      }), asyncHandler(paginate), asyncHandler(CardTemplateController.getAllCampaignCardTemplates))
  campaignRouter.route('/campaigns/:id/card-settings')
    .post(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkAdmin),
      celebrate({
        [Segments.BODY]: validator.validateCardSetting
      }), asyncHandler(CardSettingController.insert))
  campaignRouter.route('/campaigns/:id/order-limits')
    .post(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkAdmin),
      celebrate({
        [Segments.BODY]: validator.validateCampaignOrderLimit
      }), asyncHandler(CampaignOrderLimitController.insert))
  campaignRouter.route('/campaigns/:id/shipping-destinations')
    .post(asyncHandler(CampaignController.checkOwnerOrAdminOrEmployee),
      asyncHandler(checkAdmin),
      celebrate({
        [Segments.BODY]: validator.validateCampaignShippingDestination
      }), asyncHandler(CampaignShippingDestinationController.insert))
  return campaignRouter
}

export default CampaignRoutes
