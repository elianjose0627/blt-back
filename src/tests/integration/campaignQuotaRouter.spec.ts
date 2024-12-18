import chai from 'chai'
import chaiHttp from 'chai-http'
import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'
import app from '../../app'
import {
  deleteTestUser, createAdminTestUser,
  createCompanyAdministrator, createCampaignManager,
  createVerifiedCompany, verifyUser, verifyCompanyDomain,
  iversAtKreeDotKrPassword,
  sheHulkAtStarkIndustriesPassword,
  happyHoganPassword
} from '../utils'

const { expect } = chai

chai.use(chaiHttp)

let tokenAdmin: string
let tokenAdminTwo: string
let tokenCampaignManager: string
let userIdAdmin: string
let userIdAdminTwo: string

describe('Campaign Quota actions', () => {
  before(async () => {
    await createAdminTestUser('iversone@kree.kr')
    await createAdminTestUser('iverstwo@kree.kr')
    await createCompanyAdministrator()
    await createCampaignManager()

    await chai
      .request(app)
      .post('/auth/signup')
      .send({ user: { firstName: 'She', lastName: 'Hulk', email: 'shehulk@starkindustriesmarvel.com', phone: '254720123456', password: sheHulkAtStarkIndustriesPassword } })

    await verifyUser('shehulk@starkindustriesmarvel.com')

    const resAdmin = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'iversone@kree.kr', password: iversAtKreeDotKrPassword } })

    const resAdminTwo = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'iverstwo@kree.kr', password: iversAtKreeDotKrPassword } })

    const resCampaignManager = await chai
      .request(app)
      .post('/auth/login')
      .send({ user: { email: 'happyhogan@starkindustriesmarvel.com', password: happyHoganPassword } })

    tokenAdmin = resAdmin.body.token
    tokenAdminTwo = resAdminTwo.body.token
    tokenCampaignManager = resCampaignManager.body.token
    userIdAdmin = resAdmin.body.user.id
    userIdAdminTwo = resAdminTwo.body.user.id
  })

  after(async () => {
    await deleteTestUser('drstrange@starkindustriesmarvel.com')
  })

  describe('Delete a campaign quota by id', () => {
    it('Should return 204 No Content when an admin successfully deletes an quota.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Quota',
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

      const resCampainQuota = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quotas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuota: {
            orderedQuota: 100,
            orderedDate: dayjs().toISOString(),
            orderId: faker.random.alphaNumeric(10)
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-quotas/${String(resCampainQuota.body.campaignQuota.id)}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)

      expect(res).to.have.status(204)
    })

    it('Should return 403 Forbidden when a campaign manager tries to delete an quota.', async () => {
      const resCompany = await createVerifiedCompany(userIdAdmin)

      const companyId = resCompany.id

      await deleteTestUser('happyhogan@starkindustriesmarvel.com')
      await createCampaignManager()

      await chai
        .request(app)
        .patch(`/api/companies/${String(companyId)}/users`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
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

      const resCampainQuota = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quotas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuota: {
            orderedQuota: 100,
            orderedDate: dayjs().toISOString(),
            orderId: faker.random.alphaNumeric(10)
          }
        })

      const res = await chai
        .request(app)
        .delete(`/api/campaign-quotas/${String(resCampainQuota.body.campaignQuota.id)}`)
        .set('Authorization', `Bearer ${tokenCampaignManager}`)

      expect(res).to.have.status(403)
      expect(res.body).to.include.keys('statusCode', 'success', 'errors')
      expect(res.body.errors.message).to.equal('Only an admin can perform this action')
    })
  })

  describe('Update a campaign quota by id', () => {
    it('Should return 200 OK when an admin successfully updates an quota.', async () => {
      const resCompany = await chai
        .request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          company: {
            name: 'Captain Marvel Company Campaign Quota',
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

      const orderId = faker.random.alphaNumeric(10)

      const resCampainQuota = await chai
        .request(app)
        .post(`/api/campaigns/${String(resCampaign.body.campaign.id)}/quotas`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          campaignQuota: {
            orderedQuota: 100,
            orderedDate: dayjs().toISOString(),
            orderId
          }
        })

      const res = await chai
        .request(app)
        .put(`/api/campaign-quotas/${String(resCampainQuota.body.campaignQuota.id)}`)
        .set('Authorization', `Bearer ${tokenAdminTwo}`)
        .send({
          campaignQuota: {
            orderedQuota: 150,
            orderedDate: dayjs().toISOString(),
            orderId
          }
        })

      expect(res).to.have.status(200)
      expect(res.body).to.include.keys('statusCode', 'success', 'campaignQuota')
      expect(res.body.campaignQuota.orderedQuota).to.equal(150)
      expect(res.body.campaignQuota.orderId).to.equal(orderId)
      expect(res.body.campaignQuota.createdBy).to.equal(userIdAdmin)
      expect(res.body.campaignQuota.updatedBy).to.equal(userIdAdminTwo)
    })
  })
})
