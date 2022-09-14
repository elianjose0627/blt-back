import express, { Request, Response } from 'express'
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

// Set up the express app
const app = express()

// Configure cors
app.use(cors())

// Log request to the console
app.use(logger('dev'))

// Parse incoming requests data
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Add routes to the app
app.use(apiPrefix, routers.userRouter())
app.use(authPrefix, routers.authRouter())
app.use(apiPrefix, routers.profileRouter())

// Add validation middleware
app.use(joiErrors)

app.get('/', (req: Request, res: Response) => res.status(200).send({
  message: 'Welcome to the beginning of insanity',
  documentation: 'https://documenter.getpostman.com/view/5905120/VVBZQjLf'
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

// Return 404 for nonexistent routes
app.use((req: Request, res: Response) => res.status(statusCodes.NOT_FOUND).send({
  statusCode: statusCodes.NOT_FOUND,
  success: false,
  errors: {
    message: 'Route not found'
  }
}))

export default app
