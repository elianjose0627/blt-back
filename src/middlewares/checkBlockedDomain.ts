import * as statusCodes from '../constants/statusCodes'
import BlockedDomainService from '../services/BlockedDomainService'
import type { CustomNext, CustomRequest, CustomResponse, IBlockedDomain } from '../types'

const blockedDomainService = new BlockedDomainService('BlockedDomain')

const checkBlockedDomain = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { body: { user: { email } } } = req

  const records = await blockedDomainService.getAll(100, 0)
  const blockedDomains: IBlockedDomain[] = records.rows

  const emailDomain = email.split('@').pop()
  if (blockedDomains.map(blockedDomain => blockedDomain.domain).includes(emailDomain)) {
    return res.status(statusCodes.UNPROCESSABLE_ENTITY).send({
      statusCode: statusCodes.UNPROCESSABLE_ENTITY,
      success: false,
      errors: {
        message: `Kindly register with another email provider, ${String(emailDomain)} is not supported.`,
        details: [
          {
            email: `user.email with domain ${String(emailDomain)} is not supported`
          }
        ]
      }
    })
  }
  return next()
}

export default checkBlockedDomain
