import * as statusCodes from '../constants/statusCodes'
import type { CustomNext, CustomRequest, CustomResponse, IAccessPermission, Permission } from '../types'
import * as userRoles from '../utils/userRoles'
import * as permissions from '../utils/permissions'

const checkPermissions = (req: CustomRequest, res: CustomResponse, next: CustomNext): any => {
  const {
    user: currentUser,
    module,
    method,
    isOwnerOrAdmin,
    isOwner,
    accessPermissions: defaultAccessPermissions = [],
    apiKeyPermissions = []
  } = req

  const { role, company } = currentUser

  const allowed: Record<Permission, string[]> = {
    [permissions.READ]: ['GET'],
    [permissions.READWRITE]: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    [permissions.NOACCESS]: []
  }

  if (apiKeyPermissions.length > 0) {
    if (apiKeyPermissions.some(permission => permission.module === module && permission.isEnabled && allowed[permission.permission].includes(method))) {
      return next()
    }
    return res.status(statusCodes.FORBIDDEN).send({
      statusCode: statusCodes.FORBIDDEN,
      success: false,
      errors: {
        message: 'You do not have the necessary permissions to perform this action'
      }
    })
  }

  const allowedCompanyAdminModules = defaultAccessPermissions
    .filter((defaultAccessPermission: IAccessPermission) => defaultAccessPermission.role === userRoles.COMPANYADMINISTRATOR && allowed[defaultAccessPermission.permission].includes(method))
    .map((defaultAccessPermission: IAccessPermission) => defaultAccessPermission.module)

  if (role === userRoles.ADMIN || isOwnerOrAdmin === true || isOwner === true) {
    return next()
  }

  if (role === userRoles.COMPANYADMINISTRATOR && module !== undefined && allowedCompanyAdminModules.includes(module)) {
    return next()
  }

  if (company !== null) {
    const { accessPermissions } = company

    const accessPermission: IAccessPermission = accessPermissions
      .find((accessPermission: IAccessPermission) => accessPermission.module === module && accessPermission.role === role)

    const defaultAccessPermission: IAccessPermission | undefined = defaultAccessPermissions
      .find((defaultAccessPermission: IAccessPermission) => defaultAccessPermission.module === module && defaultAccessPermission.role === role)

    if (accessPermission === undefined && defaultAccessPermission === undefined) {
      return res.status(statusCodes.FORBIDDEN).send({
        statusCode: statusCodes.FORBIDDEN,
        success: false,
        errors: {
          message: 'You do not have the necessary permissions to perform this action'
        }
      })
    }

    if (
      accessPermission === undefined &&
      defaultAccessPermission !== undefined &&
      allowed[defaultAccessPermission.permission].includes(method)
    ) {
      return next()
    }

    if (accessPermission !== undefined && allowed[accessPermission.permission].includes(method)) {
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
  return res.status(statusCodes.FORBIDDEN).send({
    statusCode: statusCodes.FORBIDDEN,
    success: false,
    errors: {
      message: 'You do not have the necessary permissions to perform this action'
    }
  })
}

export default checkPermissions
