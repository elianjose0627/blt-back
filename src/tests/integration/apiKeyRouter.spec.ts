import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import app from '../../app'
import {
  deleteTestUser,
  createAdminTestUser,
  createCompanyAdministrator,
  createTestUser,
  verifyUser,
  iversAtKreeDotKrPassword,
  drStrangePassword,
  verifyCompanyDomain
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenUser: string

const jenWaltersPassword = faker.internet.password()

describe('Api Key actions', () => {
  before(async () => {
    await createAdminTestUser()
    await createCompanyAdministrator()
    await createTestUser()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'Jeniffer', lastName: 'Walters', email: 'jenwalters@starkindustriesmarvel.com', phone: '254720123456', password: jenWaltersPassword } })

    await verifyUser('jenwalters@starkindustriesmarvel.com')

    const resTest = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'drstrange@starkindustriesmarvel.com', password: drStrangePassword } })

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'ivers@kree.kr', password: iversAtKreeDotKrPassword } })

    tokenAdmin = resAdmin.body.token
    tokenUser = resTest.body.token
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
    await deleteTestUser('nickfury@starkindustriesmarvel.com')
  })

  describe('Create an api key', () => {
    it('Should return 201 Created when an admin creates an api key', async () => {
      const res = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })

      expect(res).to.have.status(201)
      expect(res.body).to.include.keys('statusCode', 'success', 'apiKey')
      expect(res.body.apiKey).to.be.an('object')
      expect(res.body.apiKey.permissions).to.be.an('array')
    })
  })

  describe('Use an api key', () => {
    it('Should return 200 OK when an admin uses an api key to get their api keys', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'apiKeys')
      expect(res.body.apiKeys).to.be.an('array')
      expect(res.body.apiKeys[0].permissions).to.be.an('array')
    })

    it('Should return 200 OK when an admin uses an api key to get their api keys', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'campaigns',
                permission: 'readwrite'
              }
            ]
          }
        })

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company API Key Test',
            email: 'test@companymarvelapikeytest.com',
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
            name: 'Onboarding API Key Test Campaign',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaign')
      expect(res.body.campaign).to.be.an('object')
    })

    it('Should return 401 Unauthorized when an admin uses an api key to get their api keys', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })

      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Test Company API Key Test 2',
            email: 'test@companymarvelapikeytest2.com',
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
            name: 'Onboarding API Key Test Campaign 2',
            type: 'onboarding',
            status: 'draft'
          }
        })

      const campaignId = String(resCampaign.body.campaign.id)

      const res = await chai
        .request(app)
        .get(`/api/campaigns/${campaignId}`)
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
      expect(res.body.errors.message).to.equal('You do not have the necessary permissions to perform this action')
    })

    it('Should return 401 Unauthorized when an admin uses an api key to get their api keys that has been revoked', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            revokedAt: dayjs().subtract(1, 'day').toDate(),
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when there is no authorization header', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            revokedAt: dayjs().subtract(1, 'day').toDate(),
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
      expect(res.body.errors.message).to.equal('No auth token')
    })

    it('Should return 401 Unauthorized when an admin uses an api key to get their api keys that has been disabled', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            isEnabled: false,
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin uses an api key to get their api keys that has validFrom in the future', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            validFrom: dayjs().add(1, 'day').toDate(),
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin uses an api key to get their api keys that has validTo in the past', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            validTo: dayjs().subtract(1, 'day').toDate(),
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin tries to use an api key to get their api keys with incorrect headers', async () => {
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${uuidv4()}`)
        .set('X-Api-Key-Id', uuidv4())

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin tries to use an api key to get their api keys with incorrect headers', async () => {
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${faker.random.numeric(10)}`)
        .set('X-Api-Key-Id', faker.random.numeric(10))

      expect(res).to.have.status(400)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin tries to use an api key to get their api keys without the correct headers', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(resApiKey.body.apiKey.secretKey)}`)

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })

    it('Should return 401 Unauthorized when an admin tries to use an api key to get their api keys with the wrong api key id', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .get('/api/api-keys')
        .set('Authorization', `Endeavour ${String(faker.random.numeric(10))}}`)
        .set('X-Api-Key-Id', String(resApiKey.body.apiKey.id))

      expect(res).to.have.status(401)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
    })
  })

  describe('Update an api key', () => {
    it('Should return 200 OK when an admin updates an api key', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .put(`/api/api-keys/${String(resApiKey.body.apiKey.id)}`)
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              },
              {
                module: 'products',
                permission: 'readwrite'
              }
            ]
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'apiKey')
      expect(res.body.apiKey).to.be.an('object')
      expect(res.body.apiKey.permissions).to.be.an('array')
      expect(res.body.apiKey.permissions).to.have.lengthOf(2)
    })

    it('Should return 403 Forbidden when a user tries to update an api key for another user', async () => {
      const resApiKey = await chai
        .request(app)
        .post('/api/api-keys')
        .set('Authorization', `Bearer ${String(tokenAdmin)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              }
            ]
          }
        })
      const res = await chai
        .request(app)
        .put(`/api/api-keys/${String(resApiKey.body.apiKey.id)}`)
        .set('Authorization', `Bearer ${String(tokenUser)}`)
        .send({
          apiKey: {
            permissions: [
              {
                module: 'orders',
                permission: 'readwrite'
              },
              {
                module: 'products',
                permission: 'readwrite'
              }
            ]
          }
        })

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors).to.include.keys('message')
      expect(res.body.errors.message).to.equal('Only the owner can perform this action')
    })
  })
})
