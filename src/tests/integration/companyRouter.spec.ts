import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../app'
import { deleteTestUser, createAdminTestUser, createCampaignManager } from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenCampaignManger: string
let userEmail: string
let token: string
// let userId: string

describe('Company actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCampaignManager()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustries.com', phone: '254724374281', password: 'mackone' } })

    const res1 = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'shehulk@starkindustries.com', password: 'mackone' } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: 'thebiggun' } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustries.com', password: 'pepperpotts' } })

    tokenAdmin = resAdmin.body.token
    token = res1.body.token
    tokenCampaignManger = resCampaignManager.body.token
    userEmail = res1.body.user.email
  })

  after(async () => {
    await deleteTestUser('drstrange@gmail.com')
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

    it('Should return 403 when a non admin tries to retrieve all companies.', async () => {
      const res = await chai
        .request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Create a company', () => {
    it('Should return 201 Create when a user creates a company.', async () => {
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
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
    })

    it('Should return 200 OK when a user creates the same company.', async () => {
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

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'company')
      expect(res.body.company).to.be.an('object')
      expect(res.body.company).to.include.keys('id', 'name', 'email', 'phone', 'vat', 'createdAt', 'updatedAt')
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
            email: 'test@company.com'
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

      expect(res).to.have.status(201)
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
            email: 'test@company.com'
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
            email: 'test@company.com'
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

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 201 Created when a campaign manager for a company successfully creates a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustries.com',
            actionType: 'add'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManger}`)
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
      expect(res.body.campaign).to.include.keys('id', 'name', 'status', 'type', 'createdAt', 'updatedAt')
    })

    it('Should return 403 Forbidden when a non-employee Campaign Manager tries to creates a campaign for a company.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      await chai
        .request(app)
        .patch(`/api/companies/${String(resCompany.body.company.id)}/users`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: {
            email: 'happyhogan@starkindustries.com',
            actionType: 'remove'
          }
        })

      const res = await chai
        .request(app)
        .post(`/api/companies/${String(resCompany.body.company.id)}/campaigns`)
        .set('Authorization', `Bearer ${tokenCampaignManger}`)
        .send({
          campaign: {
            name: 'Onboarding',
            type: 'onboarding',
            status: 'draft'
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or campaign manager can perform this action')
    })

    it('Should return 200 Success when a company owner tries to create a campaign that exists.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
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

    it('Should return 403 Forbidden when a non owner tries to create a campaign.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })

      const res = await chai
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

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or campaign manager can perform this action')
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
            email: 'test@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 200 Success when an owner successfully retrieves all campaigns with negative pagination params.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .query({
          limit: -10,
          page: -1
        })
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${token}`)

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaigns')
      expect(res.body.campaigns).to.be.an('array')
    })

    it('Should return 403 when a non owner tries to retrieve all company campaigns.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: {
            name: 'Test Company',
            email: 'test@company.com'
          }
        })
      const companyId = String(resCompany.body.company.id)

      const res = await chai
        .request(app)
        .get(`/api/companies/${companyId}/campaigns`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner or campaign manager can perform this action')
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
    })

    it('Should return 200 Success when an owner successfully adds a user to a company.', async () => {
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
        .patch(`/api/companies/${companyId}/users`)
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

    it('Should return 200 Success when an owner successfully removes a user to a company.', async () => {
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
        .patch(`/api/companies/${companyId}/users`)
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
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .query({
          limit: -10,
          page: -1
        })
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
    })

    it('Should return 403 when a non owner tries to retrieve all company users.', async () => {
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
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })
})
