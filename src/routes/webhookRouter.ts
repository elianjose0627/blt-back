import express, { Router } from 'express'
import WebhookController from '../controllers/WebhookController'
import asyncHandler from '../middlewares/asyncHandler'

const webhookRoutes = (): Router => {
  const webhookRouter = express.Router()

  webhookRouter.route('/webhooks/slack')
    .post(asyncHandler(WebhookController.postSlackEvent))
  return webhookRouter
}

export default webhookRoutes
