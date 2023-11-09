import BaseController from './BaseController'
import TokenService from '../services/TokenService'
import type { CustomRequest, CustomResponse } from '../types'
import * as statusCodes from '../constants/statusCodes'
import DotnetAuthService from '../services/DotnetAuthService'

const tokenService = new TokenService('Token')

class TokenController extends BaseController {
  async getAuthToken (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { data } = await DotnetAuthService.getAuthToken()

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      auth: data.data[0]
    })
  }

  async getRefreshToken (req: CustomRequest, res: CustomResponse): Promise<any> {
    const { body: { auth: { token } } } = req
    const { data } = await DotnetAuthService.refreshAuthToken(token)

    return res.status(statusCodes.OK).send({
      statusCode: statusCodes.OK,
      success: true,
      auth: data.data[0]
    })
  }
}

export default new TokenController(tokenService)
