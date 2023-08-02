import express from 'express'
import { celebrate, Segments } from 'celebrate'
import validator from '../validators/validators'
import PendingOrderController from '../controllers/PendingOrderController'
import asyncHandler from '../middlewares/asyncHandler'
import checkAuth from '../middlewares/checkAuth'
import checkUserIsVerifiedStatus from '../middlewares/checkUserIsVerifiedStatus'
import paginate from '../middlewares/pagination'
import checkAdmin from '../middlewares/checkAdmin'

const pendingOrderRoutes = (): any => {
  const pendingOrderRouter = express.Router()

  pendingOrderRouter.use('/pending-orders', checkAuth, checkUserIsVerifiedStatus, checkAdmin)
  pendingOrderRouter.route('/pending-orders')
    .get(celebrate({
      [Segments.QUERY]: validator.validateQueryParams
    }), asyncHandler(paginate), asyncHandler(PendingOrderController.getAll))

  return pendingOrderRouter
}

export default pendingOrderRoutes
