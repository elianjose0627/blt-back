import chai from 'chai'
import sinonChai from 'sinon-chai'
import sinon from 'sinon'
import { v4 as uuidv4 } from 'uuid'
import { mockReq, mockRes } from 'sinon-express-mock'
import checkPermissions from '../../middlewares/checkPermissions'
import * as userRoles from '../../utils/userRoles'
import * as permissions from '../../utils/permissions'
import * as appModules from '../../utils/appModules'
import { type Module, type Permission, type Role } from '../../types'

const { expect } = chai

chai.use(sinonChai)

describe('checkPermissions', () => {
  it('should allow access when user is admin', () => {
    const request = {
      user: {
        role: userRoles.ADMIN,
        company: null
      },
      method: 'GET',
      module: appModules.USERS as Module
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(next).to.have.been.calledOnce.to.be.a('function')
  })

  it('should allow access when user is owner or admin', () => {
    const request = {
      user: {
        role: userRoles.COMPANYADMINISTRATOR,
        company: null
      },
      method: 'GET',
      module: appModules.USERS as Module,
      isOwnerOrAdmin: true
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(next).to.have.been.calledOnce.to.be.a('function')
  })

  it('should allow access when user has required API key permissions', () => {
    const request = {
      user: {
        role: userRoles.COMPANYADMINISTRATOR,
        company: null
      },
      method: 'GET',
      module: appModules.USERS as Module,
      apiKeyPermissions: [{
        module: appModules.USERS as Module,
        isEnabled: true,
        permission: permissions.READ as Permission
      }]
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(next).to.have.been.calledOnce.to.be.a('function')
  })

  it('should deny access when user has insufficient permissions', () => {
    const request = {
      user: {
        role: userRoles.COMPANYADMINISTRATOR,
        company: {
          accessPermissions: []
        }
      },
      method: 'POST',
      module: appModules.USERS as Module,
      accessPermissions: []
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(res.status).to.have.been.calledWith(403)
  })

  it('should allow access when company administrator has required module permissions', () => {
    const request = {
      user: {
        role: userRoles.COMPANYADMINISTRATOR,
        company: null
      },
      method: 'GET',
      module: appModules.USERS as Module,
      accessPermissions: [{
        id: uuidv4(),
        name: 'Test Access Permission',
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        role: userRoles.COMPANYADMINISTRATOR as Role,
        module: appModules.USERS as Module,
        permission: permissions.READ as Permission
      }]
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(next).to.have.been.calledOnce.to.be.a('function')
  })

  it('should allow access when user has required company permissions', () => {
    const request = {
      user: {
        role: userRoles.EMPLOYEE,
        company: {
          accessPermissions: [{
            role: userRoles.EMPLOYEE,
            module: appModules.USERS as Module,
            permission: permissions.READ as Permission
          }]
        }
      },
      method: 'GET',
      module: appModules.USERS as Module
    }
    const req = mockReq(request)
    const res = mockRes()
    const next = sinon.spy()

    checkPermissions(req, res, next)
    expect(next).to.have.been.calledOnce.to.be.a('function')
  })
})
