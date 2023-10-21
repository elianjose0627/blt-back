import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse } from '../types'

const checkOwner = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { user: currentUser, record: { owner, email } } = req
  const { id } = req.params

  if (currentUser.id === id || currentUser.id === owner?.id || currentUser.email === email) {
    return next()
  } else {
    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'Only the owner can perform this action'
      }
    })
  }
}

export default checkOwner
