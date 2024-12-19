import chai from 'chai'
import chaiHttp from 'chai-http'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser, createCampaignManager,
  createCompanyAdministrator,
  createVerifiedCompany,
  createUnVerifiedCompanyWithExpiredDomainCode,
  verifyUser,
  verifyCompanyDomain,
  createVerifiedUser,
  createVerifiedAdminUser,
  createPrivacyRule,
  createTestUser,
  createBlockedDomain,
  setSubscriptionToPaid,
  iversAtKreeDotKrPassword,
  nickFuryPassword,
  sheHulkAtStarkIndustriesPassword,
  happyHoganPassword
} from '../utils'
import * as userRoles from '../../utils/userRoles'
import * as appModules from '../../utils/appModules'
import { IEmailTemplateType } from '../../types'
import { faker } from '@faker-js/faker'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCampaignManager: string
let tokenCompanyAdministrator: string
let userEmail: string
let token: string
let userId: string
let userIdAdmin: string

describe('Company actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCampaignManager()
    await createCompanyAdministrator()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })
    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resUser = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    const resCompanyAdministrator = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

    tokenAdmin = resAdmin.body.token
    token = resUser.body.token
    tokenCampaignManager = resCampaignManager.body.token
    tokenCompanyAdministrator = resCompanyAdministrator.body.token
    userEmail = resUser.body.user.email
    userId = resUser.body.user.id
    userIdAdmin = resAdmin.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
    await deleteTestUser('raywiretest@gmail.com')
  })

  describe('Get all companies', () => {
    it('Should return 200 Success when an admin successfully retrieves all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })

    it('Should return 200 when a non admin tries to retrieve all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })
    it('Should return 200 Success when an admin successfully searches for companies.', async () => {
      await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Search Company',
            email: 'test@searchcompany.com'
          }
        })
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          search: 'test@searchcompany.com'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })

    it('Should return 200 when a non admin tries to search for companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .query({
          search: 'Search'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companies')
      expect(res.body.companies).to.be.an('array')
    })
  })

  describe('Create a company', () => {
    it('Should return 201 Created when a user creates a company.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin creates the same company for an admin.', async () => {
      const adminUser = await createVerifiedAdminUser()
      await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: adminUser.email
          }
        })

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: adminUser.email
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when an unverified user tries to create a company.', async () => {
      const randomPassword = faker.internet.password()
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'The', lastName: 'Hulk', email: 'thehulk@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUnverifiedUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'thehulk@starkindustriesmarvel.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${String(resUnverifiedUser.body.token)}`)
        .send({
          company: {
            name: 'Test Company Hulk Out',
            email: 'test@companyhulkout.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Kindly verify your email address')
    })

    it('Should return 403 Forbidden when a user tries to create a company with an admin email account that is a company admin.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User specified is already a company admin')
    })

    it('Should return 403 Forbidden when a user tries to create a company with a domain that does not match the email.', async () => {
      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com',
            domain: 'company1.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('The email domain and the company domain do not match')
    })

    it('Should return 204 when an admin deletes a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company Deleted',
            email: 'test@company23.com'
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/companies/${String(resCompany.body.company.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 404 when a admin tries to delete a company that does not exist.', async () => {
      const res = await chai
        .request(app)
        .delete('/api/companies/88D48647-ED1C-49CF-9D53-403D7DAD8DB7')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Company not found')
    })
  })

  describe('Get and update a company', () => {
    it('Should return 200 OK when an owner gets a company by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Begot',
            email: 'test@companybegot.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company administrator gets a company by id.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a user tries to get a company by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Forbid',
            email: 'test@companyforbid.com'
          }
        })

      const companyId = resCompany.body.company.id
      const randomPassword = faker.internet.password()

      const user = await createTestUser('nebula@gotg.com', randomPassword)

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: user.email, password: randomPassword } })

      const tokenUser = resUser.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${String(tokenUser)}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 OK when an admin creates a company with an existing user role.', async () => {
      const resUser = await createVerifiedUser()

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Quill',
            email: resUser.email
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company administrator who is not an employee tries to get a company by id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company24.com'
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 OK when a company administrator updates a company.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            domain: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company administrator updates a company.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            email: 'nickfury@starkindustriesmarvel.com',
            domain: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company owner updates the role of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Pepper', lastName: 'Potts', email: 'peppot@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner updates the role of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Medusa', lastName: 'Boltagon', email: 'medusa@inhumans.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin, the owner or your company administrator can perform this action for a company employee')
    })

    it('Should return 403 Forbidden when a company owner tries to update their role.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company22.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(userId)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update your own role')
    })

    it('Should return 403 Forbidden when a company owner tries to update the role of an admin user.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company21.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(userIdAdmin)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You cannot update the role of an administrator')
    })

    it('Should return 403 Forbidden when a company campaign manager tries to update the role of an employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company20.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Gorgon', lastName: 'Petragon', email: 'gorgon@inhumans.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin, the owner or your company administrator can perform this action for a company employee')
    })

    it('Should return 404 Not Found when a company owner updates the role of an non-existent employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'tars@company19.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/7B98DA13-EF75-46BB-ABD5-F76D162C335A`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User not found')
    })
  })

  describe('Company invitation link', () => {
    it('Should return 200 OK when a company administrator gets a company invitation link and code.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('inviteLink', 'inviteCode')
    })

    it('Should return 200 OK when a company administrator gets a company invitation link and code with company invite tokens set.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokenstwo.de', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'test@companyinvitedtokenstwo.de', password } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR, userRoles.EMPLOYEE]
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('inviteLink', 'inviteCode')
    })

    it('Should return 200 OK when a company administrator updates a company invitation link and code.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: ['Employee', 'CompanyAdministrator', 'CampaignManager']
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('inviteLink', 'inviteCode', 'shortInviteLink', 'shortInviteCode', 'roles')
      expect(res.body.company.roles).to.include.keys('companyAdministrator', 'campaignManager', 'employee')
      expect(res.body.company.roles.companyAdministrator).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
      expect(res.body.company.roles.campaignManager).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
      expect(res.body.company.roles.employee).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
    })

    it('Should return 200 OK when a company administrator updates a company invitation link and code for a single role.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: ['Employee']
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('inviteLink', 'inviteCode', 'shortInviteLink', 'shortInviteCode', 'roles')
      expect(res.body.company.roles).to.include.keys('companyAdministrator', 'campaignManager', 'employee')
      expect(res.body.company.roles.companyAdministrator).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
      expect(res.body.company.roles.campaignManager).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
      expect(res.body.company.roles.employee).to.include.keys('shortInviteLink', 'shortInviteCode', 'isDomainCheckEnabled')
    })

    it('Should return 200 OK when a company administrator updates a company invitation link and code for a single role twice.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: ['Employee']
          }
        })
      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: ['Employee']
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('inviteLink', 'inviteCode', 'shortInviteLink', 'shortInviteCode', 'roles')
      expect(res.body.company.roles).to.include.keys('companyAdministrator', 'campaignManager', 'employee')
      expect(res.body.company.roles.companyAdministrator).to.include.keys('shortInviteLink', 'shortInviteCode')
      expect(res.body.company.roles.campaignManager).to.include.keys('shortInviteLink', 'shortInviteCode')
      expect(res.body.company.roles.employee).to.include.keys('shortInviteLink', 'shortInviteCode')
    })

    it('Should return 200 OK when a company administrator sets domain check for invitation links.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokenstwentytwo.de', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'test@companyinvitedtokenstwentytwo.de', password } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-link`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: [userRoles.CAMPAIGNMANAGER, userRoles.COMPANYADMINISTRATOR, userRoles.EMPLOYEE]
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: {
              Employee: true,
              CampaignManager: true,
              CompanyAdministrator: true
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('array')
    })

    it('Should return 200 OK when a company administrator sets domain check for invitation links.', async () => {
      const password = faker.internet.password()
      const companyAdmin = await createCompanyAdministrator('test@companyinvitedtokenstwentytwofour.de', password)

      const companyId = companyAdmin.companyId
      await verifyCompanyDomain(companyId)

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'test@companyinvitedtokenstwentytwofour.de', password } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/invite-domain-check`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          companyInviteToken: {
            roles: {
              Employee: true,
              CampaignManager: true,
              CompanyAdministrator: true
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('array')
    })
  })

  describe('Company Employee Data Update', () => {
    it('Should return 200 OK when a company owner updates the data of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Queen', lastName: 'Ramonda', email: 'qr@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { username: 'queenregent' } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner updates the data of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'stars@company.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Crystal', lastName: 'Amaquelin', email: 'crystal@inhumans.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { firstName: 'Crystalia' } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })

    it('Should return 404 Not Found when a company owner updates the data of an non-existent user.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'starsnoexist@company.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}/users/${String(uuidv4())}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { firstName: 'Crystalia' } })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('User not found')
    })
  })

  describe('Company Employee Email Verification', () => {
    it('Should return 200 OK when a company owner verifies the email of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Okoye', lastName: 'Dora', email: 'okoyedora@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/email-verification`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { isVerified: true } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })

    it('Should return 403 Forbidden when a company owner tries to verify the email of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'starsaligned@company.com'
          }
        })

      const companyId = resCompany.body.company.id

      await verifyCompanyDomain(String(companyId))
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Gorgon', lastName: 'Boltagon', email: 'gorgonboltagon@inhumans.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/email-verification`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { isVerified: true } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })
  })

  describe('Company Address Data Update', () => {
    it('Should return 200 OK when a company owner updates the address of an employee.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Natasha', lastName: 'Romanoff', email: 'natrom@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({ address: { country: 'Kenya', city: 'Nairobi', type: 'billing' } })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.have.keys('id', 'companyName', 'firstName', 'lastName', 'salutation', 'costCenter', 'email', 'country', 'city', 'street', 'zip', 'phone', 'addressAddition', 'affiliation', 'vat', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company owner updates the address of an non-employee.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Starlink Company',
            email: 'starlinks@company.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))
      const randomPassword = faker.internet.password()

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Maximus', lastName: 'Boltagon', email: 'maxbolt@inhumans.com', password: randomPassword } })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({ address: { country: 'Kenya', city: 'Nairobi' } })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or your company administrator can perform this action')
    })
  })

  describe('Domain Verification', () => {
    it('Should return 200 OK when a company owner requests a domain verification code', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company18.com',
            domain: 'company18.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
    })

    it('Should return 200 OK when a company owner requests a domain verification code for a verified company', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin, true)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(true)
    })

    it('Should return 200 OK when a company owner requests a domain verification code while the other one has not yet expired', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companytwo.com',
            domain: 'companytwo.com'
          }
        })

      const companyId = resCompany.body.company.id

      const resCompanyVerification = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const domainVerificationCode = resCompanyVerification.body.company.domainVerificationCode.value

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
      expect(res.body.company.domainVerificationCode.value).to.equal(domainVerificationCode)
    })

    it('Should return 403 Forbidden when a company owner requests a domain verification code with a company without a domain', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companyone.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Add a company domain first in order to perform this action')
    })

    it('Should return 200 OK when an admin updates domain verification status', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company Four',
            email: 'test@companyfour.com',
            domain: 'companyfour.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/verify-domain`)
        .send({
          company: {
            isDomainVerified: true
          }
        })
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
    })

    it('Should return 403 Forbidden when a company owner tries to verify a domain without requesting for a code', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@companythree.com',
            domain: 'companythree.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Request domain verification first to get a domain verification code')
    })

    it('Should return 403 Forbidden when a company owner tries to verify a domain with an expired code', async () => {
      const resCompany = await createUnVerifiedCompanyWithExpiredDomainCode(userIdAdmin)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('This domain verification code has expired kindly request another one')
    })

    it('Should return 200 OK when a company owner requests a domain verification code and tries to verify the domain', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Gmail Company',
            email: 'raywiretest@gmail.com',
            domain: 'gmail.com'
          }
        })

      const companyId = resCompany.body.company.id

      const resCompanyVerification = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const domainVerificationCode = resCompanyVerification.body.company.domainVerificationCode.value

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
      expect(res.body.company.isDomainVerified).to.equal(false)
      expect(res.body.company.domainVerificationCode.value).to.equal(domainVerificationCode)
    })

    it('Should return 400 Bad Request when a company owner tries to verify a non existent domain', async () => {
      const domain = 'companyfive224fwdcvsfe.com'
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: `test@${domain}`,
            domain
          }
        })

      const companyId = resCompany.body.company.id

      await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/request-domain-verification`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/verify-domain`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal(`queryTxt ENOTFOUND ${domain}`)
    })
  })

  describe('Create an address', () => {
    it('Should return 201 Created when a company owner successfully creates an address.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company17.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company administrator tries to create an address that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company16.com'
          }
        })

      const companyId = resCompany.body.company.id
      await verifyCompanyDomain(String(companyId))

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

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            type: 'billing'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nakuru',
            type: 'billing'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company owner tries to create an address that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company15.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'address')
      expect(res.body.address).to.be.an('object')
      expect(res.body.address).to.include.keys('id', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 200 Success when a company owner gets company addresses with search and filter params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company17254.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            firstName: 'Test',
            country: 'Kenya',
            city: 'Nairobi',
            affiliation: 'company'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Test',
          filter: {
            type: 'delivery',
            affiliation: 'company'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'addresses', 'meta')
      expect(res.body.addresses).to.be.an('array')
    })

    it('Should return 200 Success when a company owner gets company addresses.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company1724454.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            firstName: 'Test',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'addresses', 'meta')
      expect(res.body.addresses).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company owner tries to create an address with an unverified company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company17unverified.com'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Kindly verify your company domain')
    })
  })

  describe('Create a campaign', () => {
    it('Should return 201 Created when a company owner successfully creates a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'description', 'quota', 'correctionQuota', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 422 Unprocessable Entity when a company owner who is not an admin tries to create a campaign with quota, correctionQuota set.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14test.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft',
            quota: 100,
            correctionQuota: 10
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 201 Created when a campaign manager for a company successfully creates a campaign.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          campaign: {
            name: 'Onboarding Hires',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'description', 'quota', 'correctionQuota', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a campaign for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a campaign that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a campaign with quota, correctionQuota, isQuotaEnable, isBulkCreateEnabled and isNoteEnabled set.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft',
            quota: 100,
            correctionQuota: 10,
            isQuotaEnabled: true,
            isNoteEnabled: true,
            shippingMethodType: 12,
            shippingMethodIsDropShipping: true,
            isBulkCreateEnabled: false
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })
  })

  describe('Get all campaigns', () => {
    it('Should return 200 Success when an owner successfully retrieves all campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all unhidden campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Active',
            email: 'test@company10active.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Inactive',
            type: 'onboarding',
            status: 'draft',
            isHidden: false
          }
        })
      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Active',
            type: 'onboarding',
            status: 'draft',
            isHidden: true
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all campaigns with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all campaigns with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .query({
          limit: 1,
          page: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all campaigns.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })
  })

  describe('Create a cost center', () => {
    it('Should return 201 Created when a company owner successfully creates a cost center.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14costcenter.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          costCenter: {
            center: '1'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a campaign manager for a company tries to create a cost center.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          costCenter: {
            center: '1'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a cost center for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13costcenter.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          costCenter: {
            center: '1'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a cost center that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12costcenter.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          costCenter: {
            center: '1'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          costCenter: {
            center: '1'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a cost center.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11costcenter.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          costCenter: {
            center: '10'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenter')
      expect(res.body.costCenter).to.be.an('object')
      expect(res.body.costCenter).to.include.keys('id', 'center', 'createdAt', 'updatedAt')
    })
  })

  describe('Get cost centers', () => {
    it('Should return 200 Success when an owner successfully retrieves all cost centers.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10costcenter.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/cost-centers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          costCenter: {
            center: '5'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all cost centers with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9costcenters.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all cost centers with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8costcenters.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .query({
          limit: 1,
          page: 1,
          search: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all cost centers.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/cost-centers`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all cost centers.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6costcenters.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company cost centers for a verified company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5costcenters.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })

    it('Should return 200 when an admin retrieves all company cost centers for an unverified company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'sabasaba@company5costcenters.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/cost-centers`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'costCenters')
      expect(res.body.costCenters).to.be.an('array')
    })
  })

  describe('Create a product', () => {
    it('Should return 201 Created when a company owner successfully creates a product.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14products.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123',
            merchantSku: '123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company admin for a company tries to create a product.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1234',
            merchantSku: '1234',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a campaign manager for a company tries to create a product.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1234',
            merchantSku: '1234',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a product for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13product.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/products`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123',
            merchantSku: '123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a product that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12product.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123456',
            merchantSku: '123456',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123456',
            merchantSku: '123456',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a product.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11products.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '1234567',
            merchantSku: '1234567',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'product')
      expect(res.body.product).to.be.an('object')
      expect(res.body.product).to.include.keys('id', 'name', 'jfsku', 'merchantSku', 'productGroup', 'type', 'netRetailPrice', 'createdAt', 'updatedAt')
    })
  })

  describe('Get products', () => {
    it('Should return 200 Success when an owner successfully retrieves all products.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10productblt.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123',
            merchantSku: '123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          select: 'type, description'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
      expect(res.body.products[0]).to.not.include.keys('jfsku', 'merchantSku', 'productGroup', 'pictures', 'isVisible', 'isParent',
        'recommendedNetSalePrice', 'shippingWeight', 'weight', 'barcode',
        'upc', 'taric', 'originCountry', 'bestBeforeDate',
        'serialNumberTracking', 'width', 'height', 'length')
    })

    it('Should return 200 Success when an owner successfully retrieves all products excluding children.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Exclude Children',
            email: 'test@company10productbltexcludechildren.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const resProductParent = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Fridge 1',
            jfsku: '1231fr1',
            merchantSku: '1231fr1',
            type: 'generic',
            productGroup: 'technology',
            isParent: true
          }
        })
      const parentProductId = String(resProductParent.body.product.id)
      const resProductChild = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Fridge 2',
            jfsku: '1231fr2',
            merchantSku: '1231fr2',
            type: 'generic',
            productGroup: 'technology'
          }
        })
      const childProductId = String(resProductChild.body.product.id)
      await chai
        .request(app)
        .patch(`/api/products/${childProductId}/child`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            parentId: parentProductId
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            showChildren: 'false'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products with price filter.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Price',
            email: 'test@company10productbltprice.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123sw',
            merchantSku: '123sw',
            type: 'generic',
            productGroup: 'beverage',
            netRetailPrice: {
              amount: 100,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            minPrice: 50,
            maxPrice: 100
          },
          orderBy: {
            createdAt: 'asc',
            name: 'asc',
            price: 'asc'
          }
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products with price range filter.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Price Range',
            email: 'test@company10productbltpricerange.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Soda Water',
            jfsku: '123sw',
            merchantSku: '123sw',
            type: 'generic',
            productGroup: 'beverage',
            netRetailPrice: {
              amount: 810,
              currency: 'EUR',
              discount: 0
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            price: '800-810,700-701'
          }
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products with property params filter.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Property',
            email: 'test@company10productbltproperty.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const resProductColor = await chai
        .request(app)
        .post('/api/product-colors')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productColor: {
            name: 'black',
            hexCode: '#000000'
          }
        })

      const productColorId = resProductColor.body.productColor.id

      const resProductMaterial = await chai
        .request(app)
        .post('/api/product-materials')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productMaterial: {
            name: 'leather'
          }
        })

      const productMaterialId = resProductMaterial.body.productMaterial.id

      const resProductSize = await chai
        .request(app)
        .post('/api/product-sizes')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productSize: {
            name: '44'
          }
        })

      const productSizeId = resProductSize.body.productSize.id

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Shoes',
            jfsku: '123sw1',
            merchantSku: '123sw1',
            type: 'generic',
            productGroup: 'clothing',
            productColorId,
            productMaterialId,
            productSizeId
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            color: 'black',
            material: 'leather',
            size: '44'
          }
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products with product category filter.', async () => {
      const resProductCategory = await chai
        .request(app)
        .post('/api/product-categories')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            name: 'clothing'
          }
        })

      const productCategoryId = resProductCategory.body.productCategory.id
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Category',
            email: 'test@company10productbltcategory.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const resProduct = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          product: {
            name: 'Shoes',
            jfsku: '123sw1',
            merchantSku: '123sw1',
            type: 'generic',
            productGroup: 'clothing'
          }
        })

      const productId = resProduct.body.product.id

      await chai
        .request(app)
        .post(`/api/product-categories/${String(productCategoryId)}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          productCategory: {
            productIds: [productId]
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: 10,
          page: 1,
          filter: {
            category: 'clothing'
          }
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf.above(0)
      expect(res.body.meta.total).to.equal(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products excluding products where isVisible is set to false.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Invisible',
            email: 'test@company10productbltinvisible.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: String(companyId),
            isVisible: false,
            name: 'Soda Water',
            jfsku: '123',
            merchantSku: '123',
            type: 'generic',
            productGroup: 'beverage'
          }
        })
      await chai
        .request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          product: {
            companyId: String(companyId),
            name: 'Soda Water Fresh',
            jfsku: '1234',
            merchantSku: '1234',
            type: 'generic',
            productGroup: 'beverage'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array').lengthOf(1)
    })

    it('Should return 200 Success when an owner successfully retrieves all products with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9products.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: -10,
          page: -1,
          search: '123'
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all products with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8products.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .query({
          limit: 1,
          page: 1,
          search: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all products.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/products`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all products.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6products.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company products.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5products.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/products`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'products')
      expect(res.body.products).to.be.an('array')
    })
  })

  describe('Create a secondary domain', () => {
    it('Should return 201 Created when a company owner successfully creates a secondary domain.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14secondarydomain.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          secondaryDomain: {
            name: 'company14secondarydomain.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a campaign manager for a company successfully creates a secondary domain.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          secondaryDomain: {
            name: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a campaign manager for a company tries to create a secondary domain.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          secondaryDomain: {
            name: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a secondary domain for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13secondarydomain.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          secondaryDomain: {
            name: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a secondary domain that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12secondarydomain.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          secondaryDomain: {
            name: 'company12secondarydomain.com'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          secondaryDomain: {
            name: 'company12secondarydomain.com'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a secondary domain.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11secondarydomain.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/secondary-domains`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          secondaryDomain: {
            name: 'company11secondarydomain.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'secondaryDomain')
      expect(res.body.secondaryDomain).to.be.an('object')
      expect(res.body.secondaryDomain).to.include.keys('id', 'name', 'isVerified', 'createdAt', 'updatedAt')
    })
  })

  describe('Add a user to a company', () => {
    it('Should return 200 OK when a company owner successfully adds a user with a secondary domain to a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company 1805',
            email: 'test@company1805secondarydomain.com',
            domain: 'company1805secondarydomain.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(companyId)

      await createTestUser('nickfury@company1805secondarydomain2.com', 'avengersinitiative')

      await chai
        .request(app)
        .post(`/api/companies/${companyId}/secondary-domains`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          secondaryDomain: {
            name: 'company1805secondarydomain2.com'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@company1805secondarydomain2.com',
            actionType: 'add'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.email).to.equal('nickfury@company1805secondarydomain2.com')
    })
  })

  describe('Get all users of a company', () => {
    it('Should return 200 Success when an owner successfully retrieves all users of a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
      expect(res.body.users).to.not.include.keys('isGhost')
    })

    it('Should return 200 Success when a company admin who is an employee successfully retrieves all users of a company.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully adds a user to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 200 Success when an owner successfully adds a user to a company with a set role.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Red', lastName: 'Hulk', email: 'redhulk@starkindustriesmarvel.com', phone: '254720123456', password: randomPassword } })

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'redhulk@starkindustriesmarvel.com',
            role: userRoles.CAMPAIGNMANAGER
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.role).to.equal(userRoles.CAMPAIGNMANAGER)
    })

    it('Should return 404 Not Found when an owner tries to add a non-existent user to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)
      const email = 'shehulk@starkindustriesmarvel.com'
      const nonExistentEmail = 'shehulk1@starkindustriesmarvel.com'

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email, password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: nonExistentEmail
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal(`An invitation to register an account has been sent to ${String(nonExistentEmail)}`)
    })

    it('Should return 422 Unprocessable entity when an owner tries to add a user with a blocked email domain to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)
      await createBlockedDomain('t-online.de')

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'test@t-online.de'
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Kindly register with another email provider, t-online.de is not supported.')
    })

    it('Should return 403 Forbidden when an owner tries to add a user with a different domain to a company.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'blackagonboltagon@inhumans.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('The email domain and the company domains do not match')
    })

    it('Should return 403 Forbidden when an owner tries to add a user to a company with an unverified domain.', async () => {
      const resCompany = await createVerifiedCompany(userId, false)

      const companyId = resCompany.id

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Verify the company domain first in order to perform this action')
    })

    it('Should return 403 Forbidden when an owner tries to add a user to a company without a domain.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company4.com'
          }
        })

      const companyId = resCompany.body.company.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Add and verify a company domain first in order to perform this action')
    })

    it('Should return 200 Success when a company admin who is an employee successfully adds a user to a company.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()

      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          user: {
            email: userEmail
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
    })

    it('Should return 200 Success when an owner successfully removes a user from a company.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail,
            actionType: 'remove'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.company).to.equal(null)
    })

    it('Should return 200 Success when a company admin who is an employee successfully removes a user from a company.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: userEmail,
            actionType: 'remove'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user.company).to.equal(null)
    })

    it('Should return 200 Success when an owner successfully retrieves all users with negative pagination params.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token

      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 when a non-owner admin retrieve all company users.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company3.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all users for a company with privacy rules.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await createPrivacyRule(companyId, appModules.ADDRESSES, userRoles.COMPANYADMINISTRATOR)
      const randomPassword = faker.internet.password()

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

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Maria', lastName: 'Hill', email: 'mariahill@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi',
            street: 'Q River',
            zip: '12345',
            phone: '123456789',
            addressAddition: 'Apt 2B'
          }
        })

      const resNewUser2 = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Mara', lastName: 'Hull', email: 'marahull@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser2.body.user.email,
            actionType: 'add'
          }
        })

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/users/${String(resNewUser2.body.user.id)}/address`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: {
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })

    it('Should return 200 when an administrator who is not an employee retrieves all company users.', async () => {
      const resUser = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: sheHulkAtStarkIndustriesPassword } })

      token = resUser.body.token
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Best Company',
            email: 'testbest@company2.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'users')
      expect(res.body.users).to.be.an('array')
    })
  })

  describe('Create a legal text', () => {
    it('Should return 201 Created when a company owner successfully creates a legal text.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14legaltext.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/legal-texts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalText')
      expect(res.body.legalText).to.be.an('object')
      expect(res.body.legalText).to.include.keys('id', 'type', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a company admin for a company successfully creates a legal text.', async () => {
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/legal-texts`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalText')
      expect(res.body.legalText).to.be.an('object')
      expect(res.body.legalText).to.include.keys('id', 'type', 'template', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a legal text for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13legaltext.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/legal-texts`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 201 Created when an admin creates a legal text.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11legaltext.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/legal-texts`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalText')
      expect(res.body.legalText).to.be.an('object')
      expect(res.body.legalText).to.include.keys('id', 'type', 'template', 'createdAt', 'updatedAt')
    })
  })

  describe('Get legal texts', () => {
    it('Should return 200 Success when an owner successfully retrieves all legal texts.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10legaltexts.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/legal-texts`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          legalText: {
            type: 'privacy',
            template: {
              title: 'Privacy Policy',
              sections: [
                {
                  title: 'Privacy Policy',
                  content: 'Content'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/legal-texts`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all legal texts with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9legaltexts.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/legal-texts`)
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all legal texts with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8legaltexts.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/legal-texts`)
        .query({
          limit: 1,
          page: 1,
          search: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all legal texts.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/legal-texts`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all legal texts.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6legaltexts.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/legal-texts`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company legal texts.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5legaltexts.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/legal-texts`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'legalTexts')
      expect(res.body.legalTexts).to.be.an('array')
    })
  })

  describe('Access permissions', () => {
    let sameCompany: any
    before(async () => {
      sameCompany = await createVerifiedCompany(userId)
    })
    it('Should return 201 Created when a company owner successfully creates an access permission.', async () => {
      const res = await chai
        .request(app)
        .post(`/api/companies/${String(sameCompany.id)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: userRoles.CAMPAIGNMANAGER,
            permission: 'read'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company owner successfully creates an access permission twice.', async () => {
      const res = await chai
        .request(app)
        .post(`/api/companies/${String(sameCompany.id)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: userRoles.CAMPAIGNMANAGER,
            permission: 'read'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a company owner successfully gets all access permissions of a company.', async () => {
      const res = await chai
        .request(app)
        .get(`/api/companies/${String(sameCompany.id)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermissions')
      expect(res.body.accessPermissions).to.be.an('array')
    })

    it('Should return 403 Forbidden when a employee Campaign Manager tries to get a company by id.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 200 OK when a employee Campaign Manager with access permissions successfully gets a company by id.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: userRoles.CAMPAIGNMANAGER,
            permission: 'read'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a employee Campaign Manager with read access permissions tries to update a company by id.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/access-permissions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          accessPermission: {
            name: 'Company Permission',
            module: 'companies',
            role: userRoles.CAMPAIGNMANAGER,
            permission: 'read'
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/companies/${String(companyId)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          company: {
            email: 'nickfury@starkindustriesmarvel.com',
            domain: 'starkindustriesmarvel.com'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 201 Created when an admin creates an access permission.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11accesspermission.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
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

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 422 Unprocessable Entity when an admin tries to create an access permission for a default role.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11accesspermission121.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Campaign Permission',
            module: 'campaigns',
            role: 'CampaignManager',
            permission: 'readwrite'
          }
        })

      expect(res).to.have.status(422)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('A validation error has occured')
    })

    it('Should return 201 Created when an admin successfully creates an access permission for a default role with the override option.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Override',
            email: 'test@company11accesspermissionoverride.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Campaign Permission',
            module: 'campaigns',
            role: 'CampaignManager',
            permission: 'readwrite',
            override: true
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'accessPermission')
      expect(res.body.accessPermission).to.be.an('object')
      expect(res.body.accessPermission).to.include.keys('id', 'name', 'role', 'module', 'permission', 'isEnabled', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a campaign manager tries to create a campaign for an overridden permission for campaigns that is now read only.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/access-permissions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          accessPermission: {
            name: 'Campaign Permission',
            module: 'campaigns',
            role: 'CampaignManager',
            permission: 'read',
            override: true
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })

  describe('Create a company subscription', () => {
    it('Should return 200 OK when an admin updates the theme of a company without a subscription.', async () => {
      const company = await createVerifiedCompany(userIdAdmin, true)

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(company.id)}/theme`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            theme: {
              primaryColor: '#ffffff',
              secondaryColor: '#ffffff',
              backgroundColor: '#ffffff',
              foregroundColor: '#ffffff',
              accentColor: '#ffffff'
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'theme', 'logo', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when an admin updates the logo of a company without a subscription.', async () => {
      const company = await createVerifiedCompany(userIdAdmin, true)

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(company.id)}/logo`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            logo: {
              url: 'https://google.com/test.jpg',
              filename: 'test.jpg'
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'theme', 'logo', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a company owner successfully creates a company subscription.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company14paymentsubscription.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscription')
      expect(res.body.companySubscription).to.be.an('object')
      expect(res.body.companySubscription).to.include.keys('id', 'email', 'plan', 'startDate', 'endDate', 'paymentStatus', 'description', 'price', 'discount', 'vat', 'autoRenew', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a company admin for a company tries to update theme without a subscription.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/theme`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            theme: {
              primaryColor: '#ffffff',
              secondaryColor: '#ffffff',
              backgroundColor: '#ffffff',
              foregroundColor: '#ffffff',
              accentColor: '#ffffff'
            }
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have an active subscription')
    })

    it('Should return 200 OK when a company admin for a company successfully updates theme with a subscription.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const resSubscription = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      // set status to paid
      await setSubscriptionToPaid(resSubscription.body.companySubscription.id)

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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/theme`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)
        .send({
          company: {
            theme: {
              primaryColor: '#ffffff',
              secondaryColor: '#ffffff',
              backgroundColor: '#ffffff',
              foregroundColor: '#ffffff',
              accentColor: '#ffffff'
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
    })

    it('Should return 403 Forbidden when a campaign manager for a company tries to create a company subscription.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/subscriptions`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a company subscription for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company13companysubscription.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

      tokenCampaignManager = resCampaignManager.body.token

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/subscriptions`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a company subscription that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company12companysubscription.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companySubscription: {
            plan: 'basic',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companySubscription: {
            plan: 'basic',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscription')
      expect(res.body.companySubscription).to.be.an('object')
      expect(res.body.companySubscription).to.include.keys('id', 'email', 'plan', 'startDate', 'endDate', 'paymentStatus', 'description', 'price', 'discount', 'vat', 'autoRenew', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when an admin creates a company subscription.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company11companysubscriptions.com'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/subscriptions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscription')
      expect(res.body.companySubscription).to.be.an('object')
      expect(res.body.companySubscription).to.include.keys('id', 'email', 'plan', 'startDate', 'endDate', 'paymentStatus', 'description', 'price', 'discount', 'vat', 'autoRenew', 'createdAt', 'updatedAt')
    })
  })

  describe('Get company subscriptions', () => {
    it('Should return 200 Success when an owner successfully retrieves all company subscriptions.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company10companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companySubscription: {
            plan: 'trial',
            description: 'Company Theme',
            startDate: dayjs().utc().toDate(),
            endDate: dayjs().utc().add(1, 'month').toDate()
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all company subscriptions with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company9companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all company subscriptions with pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company8companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .query({
          limit: 1,
          page: 1,
          search: 1
        })
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })

    it('Should return 200 Success when a company administrator successfully retrieves all company subscriptions.', async () => {
      await deleteTestUser('nickfury@starkindustriesmarvel.com')
      await createCompanyAdministrator()
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
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${String(companyId)}/subscriptions`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })

    it('Should return 403 Forbidden when a company admin who is not an employee tries to retrieve all company subscriptions.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company6companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'nickfury@starkindustriesmarvel.com',
            actionType: 'remove'
          }
        })

      const resCompanyAdministrator = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'nickfury@starkindustriesmarvel.com', password: nickFuryPassword } })

      tokenCompanyAdministrator = resCompanyAdministrator.body.token

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .set('Authorization', `Bearer ${tokenCompanyAdministrator}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or administrator can perform this action')
    })

    it('Should return 200 when an admin retrieves all company company subscriptions for a verified company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company5companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })

    it('Should return 200 when an admin retrieves all company company subscriptions for an unverified company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'sabasaba@company5companysubscriptions.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/subscriptions`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'companySubscriptions')
      expect(res.body.companySubscriptions).to.be.an('array')
    })
  })

  describe('Company actions with user defined email templates', () => {
    it('Should return 404 Not Found when a company owner tries to add a user who is not in the platform and only the default account invitation template exists.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'peppot4@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('An invitation to register an account has been sent to peppot4@starkindustriesmarvel.com')
    })
    it('Should return 404 Not Found when a company owner tries to add a user who is not in the platform and a non default account invitation email template exists.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id

      const emailTemplateTypesRes = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const accountInvitationTemplateType = emailTemplateTypesRes.body.emailTemplateTypes.find((emailTemplateType: IEmailTemplateType) => emailTemplateType.type === 'accountInvitation')

      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset Hello',
            template: 'Hello World',
            emailTemplateTypeId: accountInvitationTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'peppot3@starkindustriesmarvel.com',
            actionType: 'add'
          }
        })

      expect(res).to.have.status(404)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('An invitation to register an account has been sent to peppot3@starkindustriesmarvel.com')
    })

    it('Should return 200 OK when a company owner updates the role of an employee when a non default update role email template exists.', async () => {
      const resCompany = await createVerifiedCompany(userId)

      const companyId = resCompany.id
      const randomPassword = faker.internet.password()

      const emailTemplateTypesRes = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const updateRoleTemplateType = emailTemplateTypesRes.body.emailTemplateTypes.find((emailTemplateType: IEmailTemplateType) => emailTemplateType.type === 'updateRole')

      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset Hello',
            template: 'Hello World',
            emailTemplateTypeId: updateRoleTemplateType.id
          }
        })

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Pepper', lastName: 'Potts', email: 'peppot2@starkindustriesmarvel.com', password: randomPassword } })

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: resNewUser.body.user.email,
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users/${String(resNewUser.body.user.id)}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ user: { role: userRoles.COMPANYADMINISTRATOR } })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'user')
      expect(res.body.user).to.be.an('object')
      expect(res.body.user).to.not.have.any.keys('password', 'otp', 'isDeleted')
    })
  })

  describe('Company email template actions', () => {
    it('Should return 201 Created when a user creates a company for an existent user.', async () => {
      await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk21@starkindustriesmarvel21.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })
      await verifyUser('shehulk21@starkindustriesmarvel21.com')

      const emailTemplateTypesRes = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyAccountCreationExistentTemplateType = emailTemplateTypesRes.body.emailTemplateTypes.find((emailTemplateType: IEmailTemplateType) => emailTemplateType.type === 'companyAccountCreationExistent')

      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset Hello',
            template: 'Hello World',
            emailTemplateTypeId: companyAccountCreationExistentTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'shehulk21@starkindustriesmarvel21.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a user creates a company for an nonexistent user.', async () => {
      const emailTemplateTypesRes = await chai
        .request(app)
        .get('/api/email-template-types')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      const companyAccountCreationNonexistentTemplateType = emailTemplateTypesRes.body.emailTemplateTypes.find((emailTemplateType: IEmailTemplateType) => emailTemplateType.type === 'companyAccountCreationNonexistent')

      await chai
        .request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          emailTemplate: {
            subject: 'Password Reset Hello',
            template: 'Hello World',
            emailTemplateTypeId: companyAccountCreationNonexistentTemplateType.id
          }
        })

      const res = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'shehulk22@starkindustriesmarvel22.com'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })
  })

  describe('Company shop header actions', () => {
    it('Should return 200 OK when an admin updates the shopHeader of a company.', async () => {
      const company = await createVerifiedCompany(userIdAdmin, true)

      const res = await chai
        .request(app)
        .patch(`/api/companies/${String(company.id)}/shop-header`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            shopHeader: {
              url: 'https://google.com/test.html',
              filename: 'test.html'
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'customerId', 'suffix', 'name', 'email', 'phone', 'vat', 'theme', 'logo', 'createdAt', 'updatedAt', 'shopHeader')
    })
  })
})
