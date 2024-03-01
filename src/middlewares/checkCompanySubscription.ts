import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import * as statusCodes from '../constants/statusCodes'
import * as userRoles from '../utils/userRoles'
import type { CustomNext, CustomRequest, CustomResponse, ICompanySubscription } from '../types'
import CompanySubscriptionService from '../services/CompanySubscriptionService'

dayjs.extend(utc)
dayjs.extend(relativeTime)

const companySubscriptionService = new CompanySubscriptionService('CompanySubscription')
const checkCompanySubscription = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { record: company, user: currentUser } = req
  const now = dayjs().utc().toDate()

  const records = await companySubscriptionService.getAllForCompany(100, 0, company.id)
  const subscriptions: ICompanySubscription[] = records.rows
  const activeSubscription = subscriptions
    .find(subscription => (subscription.paymentStatus === 'paid' && (now >= dayjs(subscription.startDate).utc().toDate() && now <= dayjs(subscription.endDate).utc().toDate())))

  if (activeSubscription === undefined && currentUser.role !== userRoles.ADMIN) {
    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'You do not have an active subscription'
      }
    })
  }

  return next()
}

export default checkCompanySubscription
