import { type Request, type Response } from 'express'
import { GraphQLError } from 'graphql'
import passport from 'passport'
import * as statusCodes from '../../constants/statusCodes'
interface ContextParams {
  req: Request
  res: Response
}

const getAuthenticatedUser = async (req: Request): Promise<any> => {
  return await new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err !== null) {
        return reject(new GraphQLError(err.message, { extensions: { code: 'UNAUTHORIZED', http: { status: statusCodes.UNAUTHORIZED } } }))
      }

      if (user !== false) {
        return resolve(user)
      }

      return reject(new GraphQLError(info.message, { extensions: { code: 'UNAUTHORIZED', http: { status: statusCodes.UNAUTHORIZED } } }))
    })(req)
  })
}

export const context = async ({ req, res }: ContextParams): Promise<any> => {
  const user = await getAuthenticatedUser(req)
  return { user, request: req, response: res }
}
