import passport from 'passport'
import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'

const checkResetToken = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  passport.authenticate('jwt', { session: false }, function (err, user, info) {
    if (err !== null) {
      return next(err)
    }

    if ((user !== null) && info.type === 'reset') {
      req.user = user
      return next()
    }

    return res.status(statusCodes.UNAUTHORIZED).send({
      statusCode: statusCodes.UNAUTHORIZED,
      success: false,
      errors: {
        message: info.message ?? 'Invalid token'
      }
    })
  })(req, res, next)
}

export default checkResetToken
