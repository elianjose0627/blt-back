import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'
import * as userRoles from '../utils/userRoles'

const checkAdmin = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { role } = req.user

  if (role === userRoles.ADMIN) {
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
