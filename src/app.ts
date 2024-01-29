import express, { type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import logger from 'morgan'
import passport from 'passport'
import path from 'path'
import dotenv from 'dotenv'
import joiErrors from './middlewares/joiErrors'
import * as statusCodes from './constants/statusCodes'

// Require our routes and passport into the application
import routers from './routes'
import passportAuth from './config/passport'

dotenv.config()
passportAuth(passport)

const apiPrefix = '/api'
const authPrefix = '/auth'
const limit = process.env.JSON_PAYLOAD_LIMIT

// Set up the express app
const app = express()

// Configure cors
app.use(cors())

// Log request to the console
app.use(logger('dev'))

// Parse incoming requests data
app.use(express.json({ limit }))
app.use(express.urlencoded({ extended: false, limit, parameterLimit: 2000000 }))

// Add routes to the app
app.use(apiPrefix, routers.userRouter())
app.use(authPrefix, routers.authRouter())
app.use(apiPrefix, routers.profileRouter())
app.use(apiPrefix, routers.companyRouter())
app.use(apiPrefix, routers.addressRouter())
app.use(apiPrefix, routers.recipientRouter())
app.use(apiPrefix, routers.campaignRouter())
app.use(apiPrefix, routers.salutationRouter())
app.use(apiPrefix, routers.bundleRouter())
app.use(apiPrefix, routers.bundleItemRouter())
app.use(apiPrefix, routers.pictureRouter())
app.use(apiPrefix, routers.shipmentRouter())
app.use(apiPrefix, routers.costCenterRouter())
app.use(apiPrefix, routers.productRouter())
app.use(apiPrefix, routers.orderRouter())
app.use(apiPrefix, routers.secondaryDomainRouter())
app.use(apiPrefix, routers.legalTextRouter())
app.use(apiPrefix, routers.privacyRuleRouter())
app.use(apiPrefix, routers.accessPermissionsRouter())
app.use(apiPrefix, routers.healthcheckRouter())
app.use(apiPrefix, routers.shippingMethodRouter())
app.use(apiPrefix, routers.webhookRouter())
app.use(apiPrefix, routers.pendingOrderRouter())
app.use(apiPrefix, routers.cardTemplateRouter())
app.use(apiPrefix, routers.greetingCardRouter())
app.use(apiPrefix, routers.campaignShippingDestinationRouter())
app.use(apiPrefix, routers.campaignOrderLimitRouter())
app.use(apiPrefix, routers.emailTemplateRouter())

// Add validation middleware
app.use(joiErrors)

app.get('/', (req: Request, res: Response) => res.status(200).send({
  message: 'Welcome to the beginning of insanity',
  documentation: String(process.env.API_DOCUMENTATION_URL)
}))

app.get('/favicon.ico', (req: Request, res: Response) => {
  const options = {
    root: path.join(__dirname, 'public'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
  const fileName = 'favicon.ico'
  res.status(statusCodes.OK).sendFile(fileName, options)
})

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.status === statusCodes.PAYLOAD_TOO_LARGE) {
    res.status(statusCodes.PAYLOAD_TOO_LARGE).send({
      statusCode: statusCodes.PAYLOAD_TOO_LARGE,
      success: false,
      errors: {
        message: 'Payload too large. Please limit the size of your request'
      }
    })
  }
})

// Return 404 for nonexistent routes
app.use((req: Request, res: Response) => res.status(statusCodes.NOT_FOUND).send({
  statusCode: statusCodes.NOT_FOUND,
  success: false,
  errors: {
    message: 'Route not found'
  }
}))

export default app
