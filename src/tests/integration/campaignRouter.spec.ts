import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser, verifyUser, verifyCompanyDomain } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let token: string

describe('Campaign actions', () => {
  before(async () => {
    await createAdminTestUser()

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

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
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
      expect(res.body.errors.message).to.equal('Only the owner, admin, company administrator or campaign manager can perform this action')
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
            items: [
              {
                name: 'Interdimensional Goggles',
                jfsku: '26CJ0114JWR',
                merchantSku: 'ART2394871'
              }
            ]
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
            items: [
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
            items: [
              {
                name: 'Interdimensional Goggles',
                jfsku: '26CJ0114JWR',
                merchantSku: 'ART2394871'
              }
            ]
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
            items: [
              {
                name: 'Interdimensional Goggles',
                jfsku: '26CJ0114JWR',
                merchantSku: 'ART2394871'
              }
            ]
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
            items: [
              {
                name: 'Interdimensional Goggles',
                jfsku: '26CJ0114JWR',
                merchantSku: 'ART2394871'
              }
            ]
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
            items: [
              {
                name: 'Interdimensional Goggles',
                jfsku: '26CJ0114JWR',
                merchantSku: 'ART2394871'
              }
            ]
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
  })
})
