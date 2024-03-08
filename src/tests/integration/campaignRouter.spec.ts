import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  verifyUser, verifyCompanyDomain, createPrivacyRule,
  createCompanyAdministratorWithCompany,
  createCampaignManager,
  orderTwo,
  pendingOrders
} from '../utils'
import bulkPendingOrders from '../bulkPendingOrders.json'
import humongousPendingOrders from '../humongousPendingOrders.json'
import * as userRoles from '../../utils/userRoles'
import * as appModules from '../../utils/appModules'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string
let tokenCompanyAdminTwo: string
let tokenCampaignManager: string
let companyTwoId: string

describe('Campaign actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministratorWithCompany('sharoncarter@starkindustriesmarvel2.com')
    await createCampaignManager('ronan@kree.kr', 'theaccuser')

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: 'mackone' } })
    await verifyUser('shehulk@starkindustriesmarvel.com')

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustriesmarvel.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resCompanyAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
    tokenCompanyAdminTwo = resCompanyAdminTwo.body.token
    tokenCampaignManager = resCampaignManager.body.token
    companyTwoId = resCompanyAdminTwo.body.user.company.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Get all campaigns', () => {
    it('Should return 200 OK when an admin fetches all campaigns', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel New Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

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
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 OK when an admin fetches all campaigns of a company', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel New Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

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
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 10,
          page: 1,
          'filter[companyId]': String(resCompany.body.company.id)
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 403 Forbidden when an non-admin tries to fetch all campaigns', async () => {
      const res = await chai
        .request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Update a campaign', () => {
    it('Should return 200 OK when an admin updates a campaign', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Updated Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))
      const resCampaign = await chai
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
        .put(`/api/campaigns/${String(resCampaign.body.campaign.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Updated',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign.name).to.equal('Onboarding Updated')
    })
  })

  describe('Get a campaign by id', () => {
    it('Should return 200 OK when an admin gets a campaign by id', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))
      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding One',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign.name).to.equal('Onboarding One')
    })

    it('Should return 200 OK when a company admin gets a campaign by id', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'iversone@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token
      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding One',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign.name).to.equal('Onboarding One')
    })

    it('Should return 403 Forbidden when a company admin tries a campaign that is hidden', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'iversonetwo@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token
      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding One',
            type: 'onboarding',
            status: 'draft',
            isHidden: true
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('This campaign is hidden')
    })

    it('Should return 200 OK when a company admin gets a campaign that is not active', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'iversonetwothree@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token
      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding One',
            type: 'onboarding',
            status: 'draft',
            isActive: false
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign.name).to.equal('Onboarding One')
    })
  })

  describe('Add a recipient to a campaign', () => {
    it('Should return 201 Created when a recipient is added to a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'ivers@kree.kr'
          }
        })

      await verifyCompanyDomain(String(resCompany.body.company.id))

      const resCampaign = await chai
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
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a recipient is added to a campaign by a campaign manager.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company',
            email: 'danvers@kree.kr',
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
            email: 'ronan@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
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
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a recipient is added to a campaign by a company admin.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'PB Company',
            email: 'agent13@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
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
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${companyId}/campaigns`)
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
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipient')
      expect(res.body.recipient).to.be.an('object')
      expect(res.body.recipient).to.include.keys('id', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'country', 'city', 'street', 'zip', 'createdAt', 'updatedAt')
    })
  })

  describe('Get all recipients', () => {
    it('Should return 200 Success when an owner successfully retrieves all recipients.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company 2',
            email: 'test2@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipients')
      expect(res.body.recipients).to.be.an('array')
      expect(res.body.recipients).to.have.lengthOf.above(0)
    })

    it('Should return 200 OK when an admin retrieves all campaign recipients.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company 3',
            email: 'test3@company3company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
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
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipients')
      expect(res.body.recipients).to.be.an('array')
    })

    it('Should return 200 Success when a company admin successfully retrieves all recipients with a privacy rule.', async () => {
      await verifyCompanyDomain(companyTwoId)
      await createPrivacyRule(companyTwoId, appModules.RECIPIENTS, userRoles.COMPANYADMINISTRATOR)

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyTwoId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          campaign: {
            name: 'Onboarding Privacy',
            type: 'onboarding',
            status: 'draft'
          }
        })

      await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipients')
      expect(res.body.recipients).to.be.an('array')
      expect(res.body.recipients).to.have.lengthOf.above(0)
    })

    it('Should return 200 Success when a company admin successfully retrieves all recipients with a privacy rule with street, zip and address addition set.', async () => {
      await verifyCompanyDomain(companyTwoId)
      await createPrivacyRule(companyTwoId, appModules.RECIPIENTS, userRoles.COMPANYADMINISTRATOR)

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyTwoId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          campaign: {
            name: 'Onboarding Privacy',
            type: 'onboarding',
            status: 'draft'
          }
        })

      await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          recipient: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'johndoe@doe.com',
            country: 'Kenya',
            city: 'Nairobi',
            street: 'Doe Avenue',
            zip: '1111',
            addressAddition: 'HSE 1'
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'recipients')
      expect(res.body.recipients).to.be.an('array')
      expect(res.body.recipients).to.have.lengthOf.above(0)
    })

    it('Should return 403 Forbidden when an non-owner tries to retrieves all campaign recipients.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company REd',
            email: 'testred@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)
      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
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
        .get(`/api/campaigns/${String(resCampaign.body.campaign.id)}/recipients`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })
  })

  describe('Campaign Bundles Actions', () => {
    it('Should return 201 Created when an admin successfully adds a bundle to a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Three',
            email: 'test3@companymarvelthree.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${String(campaignId)}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundle')
      expect(res.body.bundle).to.be.an('object')
    })

    it('Should return 201 Created when an admin successfully adds a bundle with items to a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Three Items',
            email: 'test3@companymarvelthreeitems.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${String(campaignId)}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle Items',
            specifications: {
              billOfMaterialsComponents: [
                {
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871',
                  name: 'Interdimensional Goggles'
                },
                {
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871',
                  name: 'Interdimensional Goggles'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundle')
      expect(res.body.bundle).to.be.an('object')
    })

    it('Should return 403 Forbidden when a non-admin user tries to add a bundle to a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Fifty Three',
            email: 'test3@companymarvelfiftythree.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${String(campaignId)}/bundles`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          bundle: {
            merchantSku: 'ART2394871',
            name: 'Interdimensional Goggles',
            speicification: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })

    it('Should return 200 OK when an admin successfully adds the same bundle to a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel Four',
            email: 'test4@companymarvelfour.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${String(campaignId)}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${String(campaignId)}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundle')
      expect(res.body.bundle).to.be.an('object')
    })

    it('Should return 200 Success when an owner successfully retrieves all bundles of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test2@companymarvel.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundles')
      expect(res.body.bundles).to.be.an('array')
      expect(res.body.bundles).to.have.lengthOf.above(0)
    })

    it('Should return 200 Success when an owner successfully retrieves all searched bundles of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test2repeat@companymarvel.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '56CJ0124JWR',
                  merchantSku: 'ART2389871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .query({
          limit: 10,
          page: 1,
          search: '39262696145050'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundles')
      expect(res.body.bundles).to.be.an('array')
      expect(res.body.bundles).to.have.lengthOf.above(0)
    })

    it('Should return 200 Success when a campaign manager successfully retrieves all bundles of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test125@kree.kr',
            domain: 'kree.kr'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronan@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundles')
      expect(res.body.bundles).to.be.an('array')
      expect(res.body.bundles).to.have.lengthOf.above(0)
    })

    it('Should return 200 Success when a company admin successfully retrieves all bundles of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test231@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'bundles')
      expect(res.body.bundles).to.be.an('array')
      expect(res.body.bundles).to.have.lengthOf.above(0)
    })
  })

  describe('Campaign Orders Actions', () => {
    it('Should return 200 Success when an owner successfully retrieves all orders of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test2@companymarvelorders.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            jfsku: 'VZ9N01SJN9E',
            merchantSku: '1552',
            name: 'Zeppelin Box - Apriil 2023',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                },
                {
                  name: 'Zeppelin Box - Apriil 2023',
                  jfsku: 'VZ9N01SJN9E',
                  merchantSku: '1552'
                }
              ]
            }
          }
        })

      await chai
        .request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          order: orderTwo
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.orders).to.have.lengthOf(0)
    })

    it('Should return 200 Success when an owner successfully retrieves all orders of a campaign with search and filter.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test2444@companymarvelorders.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            jfsku: 'VZ9N01SJN9E',
            merchantSku: '1552',
            name: 'Zeppelin Box - Apriil 2023',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                },
                {
                  name: 'Zeppelin Box - Apriil 2023',
                  jfsku: 'VZ9N01SJN9E',
                  merchantSku: '1552'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders`)
        .set('Authorization', `Bearer ${token}`)
        .query({
          limit: 10,
          page: 1,
          search: 'Ryan',
          'filter[firstname]': 'Ryan',
          'filter[lastname]': 'Wire',
          'filter[email]': 'ryan@email.com',
          'filter[city]': 'Nairobi',
          'filter[country]': 'KE'
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })

    it('Should return 200 Success when a campaign manager successfully retrieves all orders of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test125orders@kree.kr',
            domain: 'kree.kr'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'ronan@kree.kr',
            actionType: 'add'
          }
        })

      const resCampaignManager = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'ronan@kree.kr', password: 'theaccuser' } })

      tokenCampaignManager = resCampaignManager.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            jfsku: 'VZ9N01ZHS3P',
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })

    it('Should return 200 Success when a company admin successfully retrieves all orders of a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test231orders@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            jfsku: 'VZ9N01ZHS3P',
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })

    it('Should return 200 Success when a company admin successfully retrieves all orders of a campaign for custom bundle.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test231orders2@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            merchantSku: '39262696145050',
            name: 'Staffbase Bundle 1',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
    })
  })

  describe('Campaign Orders Bundle Actions', () => {
    it('Should return 200 Success when an owner successfully retrieves all orders of a campaign  bundle.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Marvel',
            email: 'test2@companymarvelcampaignbundleorders.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/bundles`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          bundle: {
            jfsku: 'VZ9N01SJN9E',
            merchantSku: '1552',
            name: 'Zeppelin Box - Apriil 2023',
            specifications: {
              billOfMaterialsComponents: [
                {
                  name: 'Interdimensional Goggles',
                  jfsku: '26CJ0114JWR',
                  merchantSku: 'ART2394871'
                },
                {
                  name: 'Zeppelin Box - Apriil 2023',
                  jfsku: 'VZ9N01SJN9E',
                  merchantSku: '1552'
                }
              ]
            }
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/orders/VZ9N01SJN9E`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'orders')
      expect(res.body.orders).to.be.an('array')
      expect(res.body.orders).to.have.lengthOf(0)
    })
  })

  describe('Campaign Pending Orders Actions', () => {
    it('Should return 201 Created when an owner successfully creates bulk orders for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion',
            email: 'test@companymarvelsecretinvasion.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 201 Created when a Company Admin successfully creates bulk orders for a campaign with a limit on the role that is not exceeded.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Captain Marvel Company Limited 3',
            email: 'iversonetwothreefourlimited3@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com',
            customerId: 788
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Limited 3',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 10,
            role: 'CompanyAdministrator'
          }
        })

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 429 Too Many Requests when a Company Admin tries to create bulk orders for a campaign with a limit on the role.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Captain Marvel Company Limited',
            email: 'iversonetwothreefourlimited@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com',
            customerId: 789
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Limited',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 1,
            role: 'CompanyAdministrator'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(429)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Campaign order limit has been exceeded')
    })

    it('Should return 429 Too Many Requests when a Company Admin tries to create bulk orders for a campaign with a limit on the role.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Captain Marvel Company Limited 2',
            email: 'iversonetwothreefourlimited2@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com',
            customerId: 789
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Limited 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 5,
            role: 'CompanyAdministrator'
          }
        })

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(429)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Campaign order limit has been exceeded')
    })

    it('Should return 403 Forbidden when a company admin tries to create bulk orders for a disabled campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'iversonetwothreefour@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft',
            isActive: false
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('This campaign is not active')
    })

    it('Should return 403 Forbidden when a company admin tries to create bulk orders for a hidden campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company One',
            email: 'iversonetwothreefourfive@starkindustriesmarvel2.com',
            domain: 'starkindustriesmarvel2.com'
          }
        })

      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(resCompany.body.company.id))

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          user: {
            email: 'sharoncarter@starkindustriesmarvel2.com',
            actionType: 'add'
          }
        })

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2.com', password: 'thepowerbroker' } })

      tokenCompanyAdminTwo = resCompanyAdmin.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft',
            isHidden: true
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCompanyAdminTwo}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('This campaign is hidden')
    })

    it('Should return 429 Too Many Requests when an owner tries creating bulk orders for a campaign that has quota enabled.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Quota',
            email: 'test@companyquota.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Quota',
            type: 'onboarding',
            status: 'draft',
            isQuotaEnabled: true
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(429)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Campaign quota has been exceeded')
    })

    it('Should return 429 Too Many Requests when an owner tries creating bulk orders for a campaign that has reached its quota.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Quota Two',
            email: 'test@companyquotatwo.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Quota Two',
            type: 'onboarding',
            status: 'draft',
            isQuotaEnabled: true,
            quota: 10,
            correctionQuota: 10
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(429)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.success).to.equal(false)
      expect(res.body.errors.message).to.equal('Campaign quota has been exceeded')
    })

    it('Should return 201 Created when an owner tries creating bulk orders for a campaign that has reached its quota but isExceedQuotaEnabled is true.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Quota Three',
            email: 'test@companyquotathree.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Quota Three',
            type: 'onboarding',
            status: 'draft',
            isQuotaEnabled: true,
            quota: 10,
            correctionQuota: 10,
            isExceedQuotaEnabled: true
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 201 Create when an admin tries creating bulk orders for a campaign that has reached its quota.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Quota Four',
            email: 'test@companyquotafour.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding Quota Four',
            type: 'onboarding',
            status: 'draft',
            isQuotaEnabled: true,
            quota: 10,
            correctionQuota: 10
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(0)
    })

    it('Should return 201 Created when an owner successfully creates 1000 bulk orders for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Humongous',
            email: 'test@companymarvelsecretinvasionhumongous.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders: bulkPendingOrders
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'pendingOrders')
      expect(res.body.pendingOrders).to.be.an('array')
      expect(res.body.pendingOrders).to.have.lengthOf.above(999)
    })

    it('Should return 413 Payload Too Large when an owner tries to create bulk orders for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Bulk',
            email: 'test@companymarvelsecretinvasionbulk.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders: humongousPendingOrders
        })

      expect(res).to.have.status(413)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Payload too large. Please limit the size of your request')
    })

    it('Should return 400 Bad Request when an owner tries to create bulk orders for a campaign belonging to a company with no customer id.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion 2',
            email: 'test2@companymarvelsecretinvasion.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal(`Contact admin to set the company customer id for ${String(resCompany.body.company.name)} - ${String(resCompany.body.company.id)}`)
    })

    it('Should return 403 Forbidden when a non-employee user without permissions tries to create bulk orders for a campaign belonging to a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion 3',
            email: 'test3@companymarvelsecretinvasion.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion 3',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or admin can perform this action')
    })

    it('Should return 403 Forbidden when a employee user without permissions tries to create bulk orders for a campaign belonging to a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion 3',
            email: 'test4@companymarvelsecretinvasion.com',
            domain: 'companymarvelsecretinvasion.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resNewUser = await chai
        .request(app)
        .post('/auth/signup')
        .send({ user: { firstName: 'Talos', lastName: 'Skrull', email: 'talos@companymarvelsecretinvasion.com', password: 'furyneedsme' } })

      await verifyUser(resNewUser.body.user.email)

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

      const resEmployee = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'talos@companymarvelsecretinvasion.com', password: 'furyneedsme' } })

      const tokenEmployee = resEmployee.body.token

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion 3',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/pending-orders`)
        .set('Authorization', `Bearer ${String(tokenEmployee)}`)
        .send({
          pendingOrders
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })
  })

  describe('Campaign Card Templates Actions', () => {
    it('Should return 201 Created when an owner successfully creates a card template for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Template',
            email: 'test@companymarvelsecretinvasioncardtemplate.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Template',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-templates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplate')
      expect(res.body.cardTemplate).to.be.an('object')
    })

    it('Should return 200 OK when an owner successfully creates a card template for a campaign twice.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Template 2',
            email: 'test@companymarvelsecretinvasioncardtemplate2.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Template',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-templates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-templates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplate')
      expect(res.body.cardTemplate).to.be.an('object')
    })

    it('Should return 200 OK when an owner successfully retrieves all card templates for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Template 3',
            email: 'test@companymarvelsecretinvasioncardtemplate3.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Template',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-templates`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardTemplate: {
            name: null,
            description: null,
            front: null,
            back: null
          }
        })

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}/card-templates`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardTemplates')
      expect(res.body.cardTemplates).to.be.an('array')
    })
  })

  describe('Campaign Card Settings Actions', () => {
    it('Should return 201 Created when an admin successfully creates a card setting for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Setting',
            email: 'test@companymarvelsecretinvasioncardsetting.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Setting',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardSetting: {
            isEnabled: true,
            isFrontSelectable: true,
            isRotationEnabled: true,
            isBackEditable: true,
            defaultBack: '',
            defaultFront: '',
            exportOrientation: 'portrait',
            exportSides: 'both',
            supplierEmail: 'ryan@biglittlethings.de'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardSetting')
      expect(res.body.cardSetting).to.be.an('object')
    })

    it('Should return 200 OK when an admin successfully creates a card setting for a campaign twice.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Setting 2',
            email: 'test@companymarvelsecretinvasioncardsetting2.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Setting',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardSetting: {
            isEnabled: true,
            isFrontSelectable: true,
            isRotationEnabled: true,
            isBackEditable: true,
            isAutoProcessingEnabled: false,
            defaultBack: '',
            defaultFront: '',
            exportOrientation: 'portrait',
            exportSides: 'both',
            supplierEmail: 'ryan@biglittlethings.de'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-settings`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          cardSetting: {
            isEnabled: true,
            isFrontSelectable: true,
            isRotationEnabled: true,
            isBackEditable: true,
            isAutoProcessingEnabled: false,
            defaultBack: '',
            defaultFront: '',
            exportOrientation: 'portrait',
            exportSides: 'both',
            supplierEmail: 'ryan@biglittlethings.de'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'cardSetting')
      expect(res.body.cardSetting).to.be.an('object')
    })

    it('Should return 403 Forbidden when a non-admin tries to create a card setting for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Card Setting User',
            email: 'test@companymarvelsecretinvasioncardsettinguser.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Card Setting',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardSetting: {
            isEnabled: true,
            isFrontSelectable: true,
            isRotationEnabled: true,
            isBackEditable: true,
            isAutoProcessingEnabled: false,
            defaultBack: '',
            defaultFront: '',
            exportOrientation: 'portrait',
            exportSides: 'both',
            supplierEmail: 'ryan@biglittlethings.de'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Campaign Order Limit Actions', () => {
    it('Should return 201 Created when an admin successfully creates an order limit for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Order Limit',
            email: 'test@companymarvelsecretinvasionorderlimit.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Order Limit',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 1,
            role: userRoles.EMPLOYEE
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignOrderLimit')
      expect(res.body.campaignOrderLimit).to.be.an('object')
    })

    it('Should return 200 OK when an admin successfully creates an order limit for a campaign twice.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Order Limit 2',
            email: 'test@companymarvelsecretinvasionorderlimit2.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Order Limit',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 1,
            role: userRoles.EMPLOYEE
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/order-limits`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignOrderLimit: {
            limit: 1,
            role: userRoles.EMPLOYEE
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignOrderLimit')
      expect(res.body.campaignOrderLimit).to.be.an('object')
    })

    it('Should return 403 Forbidden when a non-admin tries to create an order limit for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Order Limit User',
            email: 'test@companymarvelsecretinvasionorderlimituser.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Order Limit',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/card-settings`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignOrderLimit: {
            limit: 1,
            role: userRoles.EMPLOYEE
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Campaign Shipping Destination Actions', () => {
    it('Should return 201 Created when an admin successfully creates a shipping destination for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Shipping Destination',
            email: 'test@companymarvelsecretinvasionshippingdestination.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Shipping Destination',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/shipping-destinations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignShippingDestination: {
            country: 'Kenya'
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignShippingDestination')
      expect(res.body.campaignShippingDestination).to.be.an('object')
    })

    it('Should return 200 OK when an admin successfully creates a shipping destination for a campaign twice.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Shipping Destination 2',
            email: 'test@companymarvelsecretinvasionshippingdestination2.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Shipping Destination',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/shipping-destinations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignShippingDestination: {
            country: 'Kenya'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/shipping-destinations`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignShippingDestination: {
            country: 'Kenya'
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignShippingDestination')
      expect(res.body.campaignShippingDestination).to.be.an('object')
    })

    it('Should return 403 Forbidden when a non-admin tries to create a shipping destination for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Shipping Destination User',
            email: 'test@companymarvelsecretinvasionshippingdestinationuser.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Shipping Destination',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/shipping-destinations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignShippingDestination: {
            country: 'Kenya'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Campaign Address Actions', () => {
    it('Should return 201 Created when an admin successfully creates an address for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Address',
            email: 'test@companymarvelsecretinvasionaddress.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Address',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignAddresses')
      expect(res.body.campaignAddresses).to.be.an('array')
    })

    it('Should return 200 OK when an admin successfully creates an address for a campaign twice.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Address 2',
            email: 'test@companymarvelsecretinvasionaddress2.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Address',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/addresses`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignAddresses')
      expect(res.body.campaignAddresses).to.be.an('array')
    })

    it('Should return 201 Created when an owner creates an address for a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company Secret Invasion Address User',
            email: 'test@companymarvelsecretinvasionaddressuser.com',
            customerId: 123
          }
        })
      const companyId = String(resCompany.body.company.id)

      await verifyCompanyDomain(String(companyId))

      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(companyId)}/campaigns`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaign: {
            name: 'Onboarding Secret Invasion Address',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${campaignId}/addresses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'billing'
          }]
        })
      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignAddresses')
      expect(res.body.campaignAddresses).to.be.an('array')
    })

    it('Should return 201 Created when a company admin creates an address for a campaign', async () => {
      const user = await createCompanyAdministratorWithCompany('sharoncarter@starkindustriesmarvel2address.com', 'powerbroker')

      await verifyCompanyDomain(String(user.companyId))

      const resCompanyAdmin = await chai
        .request(app)
        .post('/auth/login')
        .send({ user: { email: 'sharoncarter@starkindustriesmarvel2address.com', password: 'powerbroker' } })

      const tokenCompanyAdminCustom = resCompanyAdmin.body.token
      const resCampaign = await chai
        .request(app)
        .post(`/api/companies/${String(user.companyId)}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaign: {
            name: 'Onboarding One',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/addresses`)
        .set('Authorization', `Bearer ${String(tokenCompanyAdminCustom)}`)
        .send({
          campaignAddresses: [{
            country: 'Germany',
            city: 'Berlin',
            type: 'return'
          }]
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignAddresses')
      expect(res.body.campaignAddresses).to.be.an('array')
    })
  })
})
