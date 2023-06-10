import * as statusCodes from '../constants/statusCodes'
import { CustomNext, CustomRequest, CustomResponse, IAccessPermission } from '../types'
import * as userRoles from '../utils/userRoles'
import * as permissions from '../utils/permissions'

const checkPermissions = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const { user: currentUser, module, method, isOwnerOrAdmin, isOwner, accessPermissions = [] } = req

  const { role, company } = currentUser

  const allowedCompanyAdminModules = accessPermissions
    .filter((accessPermission: IAccessPermission) => accessPermission.role === userRoles.COMPANYADMINISTRATOR)
    .map((accessPermission: IAccessPermission) => accessPermission.module)

  const allowedCampaignManagerModules = accessPermissions
    .filter((accessPermission: IAccessPermission) => accessPermission.role === userRoles.CAMPAIGNMANAGER)
    .map((accessPermission: IAccessPermission) => accessPermission.module)

  if (role === userRoles.ADMIN || isOwnerOrAdmin === true || isOwner === true) {
    return next()
  }

  if (role === userRoles.COMPANYADMINISTRATOR && module !== undefined && allowedCompanyAdminModules.includes(module)) {
    return next()
  }

  if (role === userRoles.CAMPAIGNMANAGER && module !== undefined && allowedCampaignManagerModules.includes(module)) {
    return next()
  }

  if (company !== null) {
    const { accessPermissions } = company
    const accessPermission: IAccessPermission = accessPermissions
      .find((accessPermission: IAccessPermission) => accessPermission.module === module && accessPermission.role === role)

    if (accessPermission === undefined) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You do not have the necessary permissions to perform this action'
        }
      })
    }

    const allowed = {
      [permissions.READ]: ['GET'],
      [permissions.READWRITE]: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
    }

    if (allowed[accessPermission.permission].includes(method)) {
      return next()
    } else {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You do not have the necessary permissions to perform this action'
        }
      })
    }
  }
  return next()
}

export default checkPermissions
