import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'

const checkUserIsVerifiedStatus = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { isVerified } = req.user

  if (isVerified === true) {
    return next()
  }

  return res.status(statusCodes.FORBIDDEN).send({
    statusCode: statusCodes.FORBIDDEN,
    success: false,
    errors: {
      message: 'Kindly verify your email address'
    }
  })
}

export default checkUserIsVerifiedStatus
