import { isCelebrateError, Segments } from 'celebrate'
import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import logger from '../utils/logger'

const joiErrors = (err: any, req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  if (!isCelebrateError(err)) {
    req.joiError = false
    return next(err)
  }

  logger.error(err)

  const errorArray = err.details.get(Segments.BODY)?.details.map((detail: any) => ({ [detail.context.key]: detail.message.replace(/"/g, '') }))

  return res.status(statusCodes.UNPROCESSABLE_ENTITY).json({
    statusCode: statusCodes.UNPROCESSABLE_ENTITY,
    success: false,
    errors: {
      message: 'A validation error has occured',
      details: errorArray
    }
  })
}

export default joiErrors
