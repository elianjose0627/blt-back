import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'

const checkAdmin = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { role } = req.user

  if (role === 'administrator') {
    return next()
  }

  return res.status(statusCodes.FORBIDDEN).send({
    statusCode: statusCodes.FORBIDDEN,
    success: false,
    errors: {
      message: 'Only an admin can perform this action'
    }
  })
}

export default checkAdmin
