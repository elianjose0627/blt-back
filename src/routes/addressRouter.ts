import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import AddressController from '../controllers/AddressController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'

const AddressRoutes = (): any => {
  const addressRouter = express.Router()

  addressRouter.use('/addresses', checkAuth)
  addressRouter.use('/addresses/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(AddressController.checkRecord))
  addressRouter.route('/addresses/:id')
    .get(asyncHandler(AddressController.checkOwnerOrCompanyAdministrator), asyncHandler(AddressController.get))
    .put(asyncHandler(AddressController.checkOwnerOrCompanyAdministrator), celebrate({
      [Segments.BODY]: validator.validateUpdatedAddress
    }), asyncHandler(AddressController.update))
    .delete(asyncHandler(AddressController.checkOwnerOrCompanyAdministrator), asyncHandler(AddressController.delete))
  return addressRouter
}

export default AddressRoutes
