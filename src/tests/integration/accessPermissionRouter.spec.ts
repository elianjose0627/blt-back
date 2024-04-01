import chai from 'chai'
import chaiHttp from 'chai-http'
import { v4 as uuidv4 } from 'uuid'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  verifyUser,
  createVerifiedCompany,
  verifyCompanyDomain,
  createCampaignManager,
  createCompanyAdministrator
} from '../utils'
import * as appModules from '../../utils/appModules'
import * as userRoles from '../../utils/userRoles'
import { READ, READWRITE } from '../../utils/permissions'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCampaignManager: string
let tokenCampaignManager2: string
let tokenCompanyAdministrator: string
let userId: string

describe('Access Permissions actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCampaignManager('ronanac@kree.kr', 'theaccuser')
    await createCampaignManager('ronanac2@kreeaccesspermissioncampaignmanager.kr', 'theaccuser')
    await createCompanyAdministrator()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    const resCampaignManager2 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ronanac2@kreeaccesspermissioncampaignmanager.kr', password: 'theaccuser' } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCampaignManager2 = resCampaignManager2.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    userId = resUser.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Create an access permission', () => {
    it('Should return 201 Created when an admin creates an access permission.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: 'CampaignManager',
            permission: 'read',
            companyId
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 422 Unprocessable Entity when a company admin tries to create an access permission for a default role.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: 'captainmarvel' } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'bundles',
            role: 'CampaignManager',
            permission: 'read',
            companyId
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 404 Not Found when an admin tries to create an access permission with a non-existent company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: 'CampaignManager',
            permission: 'read',
            companyId: uuidv4()
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })

    it('Should return 422 Unprocessable Entity when an admin tries to create an access permission for a default role.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Campaign Manager Read Campaigns',
            module: 'campaigns',
            role: 'CampaignManager',
            permission: 'read',
            companyId
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 422 Unprocessable Entity when an admin tries to create a readwrite access permission for a readonly module.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const res = await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Campaign Manager Read Write Products',
            module: appModules.PRODUCTS,
            role: userRoles.CAMPAIGNMANAGER,
            permission: READWRITE,
            companyId
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })
  })

  describe('Get all access permissions', () => {
    it('Should return 200 OK when an admin gets all access permissions.', async () => {
      const res = await chai
        .request(app)
        .get('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermissions')
      expect(res.body.accessPermissions).to.be.an('array')
    })

    it('Should return 200 OK when an admin gets all access permissions for a company', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      await chai
        .request(app)
        .post('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: 'CampaignManager',
            permission: 'read',
            companyId
          }
        })

      const res = await chai
        .request(app)
        .get('/api/access-permissions')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[companyId]': companyId
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermissions')
      expect(res.body.accessPermissions).to.be.an('array').lengthOf.greaterThan(0)
    })
  })

  describe('Get default access permissions', () => {
    it('Should return 200 OK when an admin gets all default permissions.', async () => {
      const res = await chai
        .request(app)
        .get('/api/access-permissions/default')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermissions')
      expect(res.body.accessPermissions).to.be.an('array')
    })
    it('Should return 403 Forbidden when a user tries to get all default permissions.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Rouge', lastName: 'Rouge', email: 'rouge@starkindustriesmarvel.com', phone: '254720123456', password: 'wolverine' } })

      await verifyUser('rouge@starkindustriesmarvel.com')

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'rouge@starkindustriesmarvel.com', password: 'wolverine' } })

      const tokenUser = resUser.body.token
      const res = await chai
        .request(app)
        .get('/api/access-permissions/default')
        .set('Authorization', `Bearer ${String(tokenUser)}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })

  describe('Get, Edit, Delete, Update access permissions', () => {
    it('Should return 200 OK when an owner gets an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company',
            email: 'ivers@kreeaccesspermission.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .get(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'module', 'role', 'permission', 'isEnabled', 'createdAt', 'updatedAt', 'company')
    })

    it('Should return 200 OK when an owner with company not set with a role of user gets an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company',
            email: 'ivers@kreeaccesspermissionnoneadmin.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .get(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'module', 'role', 'permission', 'isEnabled', 'createdAt', 'updatedAt', 'company')
    })

    it('Should return 200 OK when a campaign manager who is an owner gets an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenCampaignManager2}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company',
            email: 'ivers@kreeaccesspermissioncampaignmanager.kr',
            domain: 'kreeaccesspermissioncampaignmanager.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronanac2@kreeaccesspermissioncampaignmanager.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronanac2@kreeaccesspermissioncampaignmanager.kr', password: 'theaccuser' } })

      tokenCampaignManager2 = resCampaignManager.body.token

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenCampaignManager2}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .get(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager2}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'module', 'role', 'permission', 'isEnabled', 'createdAt', 'updatedAt', 'company')
    })

    it('Should return 200 OK when an admin gets an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company',
            email: 'ivers@kreeaccesspermission2545.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .get(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'module', 'role', 'permission', 'isEnabled', 'createdAt', 'updatedAt', 'company')
    })

    it('Should return 403 Forbidden when a user without a company tries to get an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company 1984',
            email: 'ivers@kreeaccesspermission1984.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Rouge', lastName: 'One', email: 'rougeone@starkindustriesmarvel.com', phone: '254720123456', password: 'wolverine' } })

      await verifyUser('rougeone@starkindustriesmarvel.com')

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'rougeone@starkindustriesmarvel.com', password: 'wolverine' } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .get(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${String(tokenUser)}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })

    it('Should return 403 Forbidden when a campaign manager without access tries to update an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company 1',
            email: 'iversaccesspermissions2@kree.kr',
            domain: 'kree.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronanac@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronanac@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .put(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'read'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 200 OK when a campaign manager with access successfully updates an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company 1',
            email: 'iversaccesspermissions33@kree.kr',
            domain: 'kree.kr'
          }
        })

      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(companyId)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronanac@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronanac@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: appModules.COSTCENTERS,
            role: userRoles.CAMPAIGNMANAGER,
            permission: READWRITE
          }
        })

      const accessPermissionId = resAccessPermission.body.accessPermission.id

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Access Permission',
            module: appModules.ACCESSPERMISSIONS,
            role: userRoles.CAMPAIGNMANAGER,
            permission: READWRITE
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: appModules.COSTCENTERS,
            role: userRoles.CAMPAIGNMANAGER,
            permission: READ
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.success).to.equal(true)
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'module', 'role', 'permission', 'isEnabled', 'createdAt', 'updatedAt', 'company')
    })

    it('Should return 200 OK when an administrator deletes an access permission by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company 2',
            email: 'ivers@kreeaccesspermission2.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })
      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .delete(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a user deletes an access by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Access Permission Company 3',
            email: 'ivers@kreeaccesspermission3.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resAccessPermission = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Cost Center Permission',
            module: 'costCenters',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })
      const accessPermissionId = resAccessPermission.body.accessPermission.id

      const res = await chai
        .request(app)
        .delete(`/api/access-permissions/${String(accessPermissionId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })
  })
})
