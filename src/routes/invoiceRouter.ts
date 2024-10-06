import express, { Router } from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import InvoiceController from '../controllers/InvoiceController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAdmin from '../middlewares/checkAdmin'
import checkAuth from '../middlewares/checkAuth'
import paginate from '../middlewares/pagination'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'

const invoiceRoutes = (): Router => {
  const invoiceRouter = express.Router()

  invoiceRouter.use('/invoices', checkAuth, checkUserIsVerifiedStatus, InvoiceController.setModule)
  invoiceRouter.route('/invoices')
    .get(celebrate({
      [Segments.QUERY]: validator.validateInvoiceQueryParams
    }), asyncHandler(paginate), asyncHandler(InvoiceController.getAll))
  invoiceRouter.use('/invoices/:id', celebrate({
    [Segments.PARAMS]: validator.validateUUID
  }, { abortEarly: false }), asyncHandler(InvoiceController.checkRecord))
  invoiceRouter.route('/invoices/:id')
    .get(asyncHandler(InvoiceController.checkOwnerOrCompanyOrAdmin), asyncHandler(InvoiceController.get))
    .delete(asyncHandler(checkAdmin), asyncHandler(InvoiceController.delete))
  return invoiceRouter
}

export default invoiceRoutes
