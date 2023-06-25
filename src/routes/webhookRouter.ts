import express from 'express'
import WebhookController from '../controllers/WebhookController'
import asyncHandler from '../middlewares/asyncHandler'

const webhookRoutes = (): any => {
  const webhookRouter = express.Router()

  webhookRouter.route('/webhooks/slack')
    .post(asyncHandler(WebhookController.postSlackEvent))
  return webhookRouter
}

export default webhookRoutes
