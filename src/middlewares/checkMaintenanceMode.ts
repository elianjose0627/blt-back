import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as statusCodes from '../constants/statusCodes'
import MaintenanceModeService from '../services/MaintenanceModeService'
import type { CustomNext, CustomRequest, CustomResponse, IMaintenanceMode } from '../types'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)

const maintenanceModeService = new MaintenanceModeService('MaintenanceMode')
const checkMaintenanceMode = async (req: CustomRequest, res: CustomResponse, next: CustomNext): Promise<any> => {
  const { method } = req
  const disallowedMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

  const now = dayjs().toDate()

  const records = await maintenanceModeService.getAll(100, 0)
  const maintenanceModes: IMaintenanceMode[] = records.rows
  const inMaintenance = maintenanceModes.find(maintenanceMode => (now >= maintenanceMode.startDate && now <= maintenanceMode.endDate))

  if (inMaintenance !== undefined && disallowedMethods.includes(method)) {
    const retryInterval = dayjs(inMaintenance.endDate).diff(dayjs(inMaintenance.startDate), 'second')
    res.setHeader('Retry-After', retryInterval)
    return res.status(statusCodes.SERVICE_UNAVAILABLE).send({
      statusCode: statusCodes.SERVICE_UNAVAILABLE,
      success: false,
      errors: {
        message: `Service unavailable and will be back ${dayjs(now).to(inMaintenance.endDate)}: ${inMaintenance.reason}`
      }
    })
  }

  return next()
}

export default checkMaintenanceMode
