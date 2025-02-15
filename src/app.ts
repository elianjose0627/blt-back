import express, { type NextFunction, type Request, type Response } from 'express'
import cors, { CorsRequest } from 'cors'
import logger from 'morgan'
import passport from 'passport'
import path from 'path'
import dotenv from 'dotenv'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import http from 'http'
import joiErrors from './middlewares/joiErrors'
import * as statusCodes from './constants/statusCodes'
import routes, { maintenanceModeBypassRoutes } from './routes'
import passportAuth from './config/passport'
import checkMaintenanceMode from './middlewares/checkMaintenanceMode'
import resolvers from './graphql/resolvers'
import typeDefs from './graphql/schemas'
import { context } from './graphql/context'

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

// Routes that bypass maintenance mode
app.use(apiPrefix, maintenanceModeBypassRoutes.maintenanceModeRouter())
app.use(authPrefix, maintenanceModeBypassRoutes.authRouter())
app.use(apiPrefix, maintenanceModeBypassRoutes.webhookRouter())

// Middleware to check for maintenance mode
app.use(checkMaintenanceMode)

// Add routes to the app
app.use(apiPrefix, routes)

// Add validation middleware
app.use(joiErrors)

app.get('/', (req: Request, res: Response) => res.status(200).send({
  message: 'Welcome to the beginning of insanity',
  documentation: String(process.env.API_DOCUMENTATION_URL)
}))

app.get('/favicon.ico', (req: Request, res: Response) => {
  const options = {
    root: path.join(__dirname, 'public')
  }
  const fileName = 'favicon.ico'
  res.status(statusCodes.OK).sendFile(fileName, options)
})

app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  if (err.status === statusCodes.PAYLOAD_TOO_LARGE) {
    res.status(statusCodes.PAYLOAD_TOO_LARGE).send({
      statusCode: statusCodes.PAYLOAD_TOO_LARGE,
      success: false,
      errors: {
        message: 'Payload too large. Please limit the size of your request'
      }
    })
  }
  next(err)
})

export const appHttpServer = http.createServer(app)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer: appHttpServer })]
})

void server.start()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Apollo GraphQL server started successfully')

    app.use(
      '/graphql',
      cors<CorsRequest>(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => await context({ req, res })
      })
    )

    // Return 404 for nonexistent routes
    app.use((req: Request, res: Response) => res.status(statusCodes.NOT_FOUND).send({
      statusCode: statusCodes.NOT_FOUND,
      success: false,
      errors: {
        message: 'Route not found'
      }
    }))
  })

export default app
