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

  let errorDetails: any = []
  // capture errors in the request body
  const bodyErrors = err.details.get(Segments.BODY)?.details
  if (bodyErrors != null) {
    errorDetails = [...errorDetails, ...bodyErrors]
  }

  // capture errors in the query parameters
  const queryErrors = err.details.get(Segments.QUERY)?.details
  if (queryErrors != null) {
    errorDetails = [...errorDetails, ...queryErrors]
  }

  // capture errors in the URL parameters
  const paramsErrors = err.details.get(Segments.PARAMS)?.details
  if (paramsErrors != null) {
    errorDetails = [...errorDetails, ...paramsErrors]
  }

  const errorArray = errorDetails.map((detail: any) => ({ [detail.context.key]: detail.message.replace(/"/g, '') }))

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
