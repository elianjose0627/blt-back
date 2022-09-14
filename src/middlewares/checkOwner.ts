import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'

const checkOwner = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { user: currentUser, record: { owner, trainer } } = req
  const { id } = req.params

  if (currentUser.id === id || currentUser.id === owner?.id || currentUser.id === trainer?.id) {
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
