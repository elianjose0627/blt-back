import express, { Router } from 'express'
import HealthCheckController from '../controllers/HealthCheckController'
import asyncHandler from '../middlewares/asyncHandler'

const healthcheckRoutes = (): Router => {
  const healthcheckRouter = express.Router()

  healthcheckRouter.route('/health-checks')
    .get(asyncHandler(HealthCheckController.get))
  return healthcheckRouter
}

export default healthcheckRoutes
