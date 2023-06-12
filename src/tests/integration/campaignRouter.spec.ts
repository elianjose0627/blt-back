import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  verifyUser, verifyCompanyDomain, createPrivacyRule,
  createCompanyAdministratorWithCompany,
  createCampaignManager,
  orderTwo
} from '../utils'
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
      const res = await chai
        .request(app)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${tokenAdmin}`)

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
      expect(res.body.orders).to.have.lengthOf.above(0)
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
      expect(res.body.orders).to.have.lengthOf.above(0)
    })
  })
})
