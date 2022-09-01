import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse } from '../types'
import logger from '../utils/logger'

const errorMessages = [
  'Request failed with status code 400'
]

const errorNames = [
  'SequelizeConnectionError'
]

const asyncHandler = (cb: any) => async (req: CustomRequest, res: CustomResponse, next: CustomNext) => {
  try {
    const result = await cb(req, res, next)
    return result
  } catch (err: any) {
    logger.error(err)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(statusCodes.BAD_REQUEST).json({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: err.errors[0].message
        }
      })
    }

    if (errorMessages.includes(err.message) || errorNames.includes(err.name)) {
      return res.status(statusCodes.BAD_REQUEST).json({
        statusCode: statusCodes.BAD_REQUEST,
        success: false,
        errors: {
          message: err.message
        }
      })
    }

    return res.status(statusCodes.SERVER_ERROR).json({
      statusCode: statusCodes.SERVER_ERROR,
      success: false,
      errors: {
        message: err.message
      }
    })
  }
}

export default asyncHandler
